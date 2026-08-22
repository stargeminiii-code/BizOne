import { UserAccount, UserRole, UserSession, SystemAuditEntry } from '../types';
import { INITIAL_USERS, ROLE_DEFINITIONS } from '../data/userData';
import { INITIAL_SYSTEM_AUDIT_LOGS } from '../data/infrastructureData';

const USERS_STORAGE_KEY = 'wiup_users_db_v2';
const CURRENT_SESSION_KEY = 'wiup_active_session_user_v2';
const TOKEN_STORAGE_KEY = 'wiup_auth_token_v2';
const AUDIT_LOGS_STORAGE_KEY = 'wiup_audit_logs_v2';
const CUSTOM_ROLES_STORAGE_KEY = 'wiup_custom_roles_v2';

export interface CustomRoleDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  badgeColor: string;
  isSystemDefault: boolean;
  permissions: UserAccount['permissions'];
  createdAt: string;
  createdBy: string;
}

export interface SessionTokenPayload {
  uid: string;
  sub: string;
  email: string;
  role: UserRole;
  tenant: 'enterprise' | 'demo';
  scope: string;
  sid: string;
  iat: number;
  exp: number;
}

export const INITIAL_CUSTOM_ROLES: CustomRoleDefinition[] = Object.entries(ROLE_DEFINITIONS).map(
  ([key, def]) => ({
    id: `role-${key}`,
    key,
    name: def.name,
    description: def.description,
    badgeColor: def.badgeColor,
    isSystemDefault: true,
    permissions: def.defaultPermissions,
    createdAt: '2026-01-01 00:00',
    createdBy: 'Hệ thống'
  })
);

export class AuthService {
  // Normalize phone numbers for robust matching (+84, 84, 0, spaces, dashes)
  static normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('84') && digits.length >= 10) {
      return '0' + digits.slice(2);
    }
    return digits;
  }

  // Parse and verify token validity & expiration from client perspective
  static verifyToken(token: string): { valid: boolean; payload?: SessionTokenPayload; error?: string } {
    if (!token || (!token.startsWith('bizone_jwt.') && !token.startsWith('wiup_jwt.'))) {
      return { valid: false, error: 'Token không đúng định dạng BizOne ERP' };
    }

    try {
      const cleanToken = token.startsWith('bizone_jwt.') ? token.replace('bizone_jwt.', '') : token.replace('wiup_jwt.', '');
      const parts = cleanToken.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Cấu trúc Token không hợp lệ' };
      }

      const payloadJson = decodeURIComponent(escape(atob(parts[1])));
      const payload: SessionTokenPayload = JSON.parse(payloadJson);

      const now = Date.now();
      if (payload.exp && now > payload.exp) {
        return { valid: false, error: 'Phiên đăng nhập (Session Token) đã hết hạn. Vui lòng đăng nhập lại.' };
      }

      return { valid: true, payload };
    } catch (e) {
      return { valid: false, error: 'Không thể giải mã Session Token' };
    }
  }

  // Get active session token from LocalStorage
  static getActiveToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  // Set active session token
  static setSessionToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Could not save session token', e);
    }
  }

  // Get all users from storage or fallback to defaults
  static getUsers(): UserAccount[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read users from localStorage', e);
    }

    AuthService.saveUsers(INITIAL_USERS);
    return INITIAL_USERS;
  }

  // Save users list to localStorage
  static saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Could not save users to localStorage', e);
    }
  }

  // Get active session user with token verification
  static getCurrentUser(): UserAccount | null {
    try {
      const token = AuthService.getActiveToken();
      if (token) {
        const verification = AuthService.verifyToken(token);
        if (!verification.valid) {
          AuthService.clearSession();
          return null;
        }
      }

      const stored = localStorage.getItem(CURRENT_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          const users = AuthService.getUsers();
          const fresh = users.find((u) => u.id === parsed.id);
          if (fresh && fresh.status !== 'locked' && fresh.status !== 'inactive') {
            return fresh;
          }
          if (parsed && parsed.status !== 'locked' && parsed.status !== 'inactive') {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse active session', e);
    }
    return null;
  }

  // Set active session user
  static setCurrentUser(user: UserAccount | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    } catch (e) {
      console.error('Could not set current session', e);
    }
  }

  // Clear all session artifacts
  static clearSession(): void {
    try {
      localStorage.removeItem(CURRENT_SESSION_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      console.error('Could not clear session', e);
    }
  }

  // Verify Current Session Status (client verification + backend verification if possible)
  static verifyCurrentSession(): { isAuthenticated: boolean; user: UserAccount | null; token: string | null } {
    const token = AuthService.getActiveToken();
    if (!token) {
      return { isAuthenticated: false, user: null, token: null };
    }

    const tokenVerification = AuthService.verifyToken(token);
    if (!tokenVerification.valid) {
      AuthService.clearSession();
      return { isAuthenticated: false, user: null, token: null };
    }

    const user = AuthService.getCurrentUser();
    if (!user) {
      return { isAuthenticated: false, user: null, token: null };
    }

    return { isAuthenticated: true, user, token };
  }

  /**
   * Primary Backend Authentication Endpoint Integration
   * Sends credentials to /api/auth/login where bcrypt verification,
   * tenant check, locking policy, and JWT session generation take place.
   */
  static async login(
    identifier: string,
    passwordPlain: string,
    rememberMe: boolean = true
  ): Promise<{
    success: boolean;
    user?: UserAccount;
    token?: string;
    error?: string;
    errorType?: string;
    requirePasswordChange?: boolean;
  }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: passwordPlain.trim(),
          rememberMe
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user && data.token) {
        // Save session token and user to client storage
        AuthService.setSessionToken(data.token);
        AuthService.setCurrentUser(data.user);

        // Synchronize in local users list
        const currentUsers = AuthService.getUsers();
        const updatedUsers = currentUsers.map((u) => (u.id === data.user.id ? data.user : u));
        if (!updatedUsers.some((u) => u.id === data.user.id)) {
          updatedUsers.unshift(data.user);
        }
        AuthService.saveUsers(updatedUsers);

        return {
          success: true,
          user: data.user,
          token: data.token,
          requirePasswordChange: data.user.forcePasswordChange
        };
      }

      return {
        success: false,
        error: data.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.',
        errorType: data.errorType
      };
    } catch (err: any) {
      console.error('Login network error:', err);
      return {
        success: false,
        error: 'Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra kết nối mạng.'
      };
    }
  }

  // Alias for backward compatibility
  static async authenticate(
    identifier: string,
    passwordPlain: string,
    rememberMe: boolean = true
  ) {
    return AuthService.login(identifier, passwordPlain, rememberMe);
  }

  // Backend session verification
  static async verifySessionWithServer(): Promise<boolean> {
    const token = AuthService.getActiveToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (response.ok && data.valid && data.user) {
        AuthService.setCurrentUser(data.user);
        return true;
      } else {
        AuthService.clearSession();
        return false;
      }
    } catch (e) {
      // If network offline, verify token locally
      const local = AuthService.verifyToken(token);
      return local.valid;
    }
  }

  // Logout handler with server notification and token clearance
  static async logout(user: UserAccount | null): Promise<void> {
    const token = AuthService.getActiveToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      } catch (e) {
        console.warn('Logout notification error:', e);
      }
    }
    AuthService.clearSession();
  }

  // Get Audit Logs
  static getAuditLogs(): SystemAuditEntry[] {
    try {
      const stored = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read audit logs', e);
    }
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_AUDIT_LOGS));
    return INITIAL_SYSTEM_AUDIT_LOGS;
  }

  // Append Audit Log
  static addAuditLog(entry: Omit<SystemAuditEntry, 'id' | 'timestamp'>): void {
    try {
      const current = AuthService.getAuditLogs();
      const newEntry: SystemAuditEntry = {
        ...entry,
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      const updated = [newEntry, ...current].slice(0, 500);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(updated));

      // Asynchronously send to server if token exists
      const token = AuthService.getActiveToken();
      if (token) {
        fetch('/api/auth/audit-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newEntry)
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to log audit action', e);
    }
  }

  // Get Custom Roles
  static getCustomRoles(): CustomRoleDefinition[] {
    try {
      const stored = localStorage.getItem(CUSTOM_ROLES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read custom roles', e);
    }
    localStorage.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOM_ROLES));
    return INITIAL_CUSTOM_ROLES;
  }

  // Save Custom Roles
  static saveCustomRoles(roles: CustomRoleDefinition[]): void {
    try {
      localStorage.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(roles));
    } catch (e) {
      console.error('Could not save custom roles', e);
    }
  }

  // Admin lock/unlock user via backend API
  static async toggleLockUser(
    targetUserId: string,
    performer: UserAccount
  ): Promise<{ success: boolean; message: string; updatedUser?: UserAccount }> {
    const token = AuthService.getActiveToken();
    try {
      const response = await fetch('/api/auth/toggle-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Sync local users
        const users = AuthService.getUsers();
        const updated = users.map((u) => (u.id === targetUserId ? data.updatedUser : u));
        AuthService.saveUsers(updated);
        return { success: true, message: data.message, updatedUser: data.updatedUser };
      }
      return { success: false, message: data.error || 'Thao tác không thành công.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi kết nối máy chủ.' };
    }
  }

  // Admin reset password for user with Bcrypt hashing via backend API
  static async resetPassword(
    targetUserId: string,
    newPasswordPlain: string,
    requireChangeNextLogin: boolean,
    performer: UserAccount
  ): Promise<{ success: boolean; message: string }> {
    const token = AuthService.getActiveToken();
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId,
          newPassword: newPasswordPlain,
          requireChangeNextLogin
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Không thể đặt lại mật khẩu.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi kết nối máy chủ.' };
    }
  }
}
