import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Laptop,
  Smartphone,
  Tablet,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Sliders,
  History,
  Building,
  Warehouse as WarehouseIcon,
  LogOut,
  Send,
  MessageSquare
} from 'lucide-react';
import {
  UserAccount,
  UserRole,
  PermissionAction,
  UserSession,
  SystemAuditEntry,
  Warehouse
} from '../types';
import { ROLE_DEFINITIONS, MODULE_LIST, ALL_PERMISSION_ACTIONS } from '../data/userData';
import { INITIAL_SYSTEM_AUDIT_LOGS } from '../data/infrastructureData';

interface UsersRolesViewProps {
  users: UserAccount[];
  warehouses: Warehouse[];
  onSaveUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  currentUser?: UserAccount;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  users,
  warehouses,
  onSaveUser,
  onDeleteUser,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles_matrix' | 'sessions' | 'audit_logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('ALL');
  const [auditLogs, setAuditLogs] = useState<SystemAuditEntry[]>(INITIAL_SYSTEM_AUDIT_LOGS);

  // Selected user for details/modal
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(users[0] || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalUserData, setModalUserData] = useState<Partial<UserAccount>>({});
  const [isAuditDiffModalOpen, setIsAuditDiffModalOpen] = useState(false);
  const [activeAuditEntry, setActiveAuditEntry] = useState<SystemAuditEntry | null>(null);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const matchDept = selectedDepartmentFilter === 'ALL' || u.department === selectedDepartmentFilter;
    return matchSearch && matchRole && matchDept;
  });

  const handleOpenAddUser = () => {
    setModalUserData({
      name: '',
      username: '',
      email: '',
      employeeCode: `NV-000${users.length + 1}`,
      phone: '',
      department: 'Khối Vận Hành & Kho Bãi',
      position: 'Chuyên viên Vận Hành',
      role: 'warehouse_staff',
      status: 'active',
      branchId: 'BR01',
      assignedWarehouseIds: ['WH01'],
      twoFactorEnabled: false,
      forcePasswordChange: true,
      permissions: { ...ROLE_DEFINITIONS.warehouse_staff.defaultPermissions }
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditUser = (user: UserAccount) => {
    setModalUserData({
      ...user,
      assignedWarehouseIds: user.assignedWarehouseIds || ['ALL'],
      permissions: { ...user.permissions }
    });
    setIsEditModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalUserData.name || !modalUserData.email) return;

    const roleDef = ROLE_DEFINITIONS[modalUserData.role as UserRole] || ROLE_DEFINITIONS.warehouse_staff;

    const saved: UserAccount = {
      id: modalUserData.id || `usr-${Date.now()}`,
      username: modalUserData.username || modalUserData.email.split('@')[0],
      email: modalUserData.email,
      name: modalUserData.name,
      employeeCode: modalUserData.employeeCode || `NV-${Date.now().toString().slice(-4)}`,
      phone: modalUserData.phone,
      department: modalUserData.department,
      position: modalUserData.position,
      role: modalUserData.role as UserRole,
      roleTitle: roleDef.name,
      status: (modalUserData.status as any) || 'active',
      branchId: modalUserData.branchId || 'BR01',
      branchName: modalUserData.branchId === 'BR02' ? 'Chi nhánh Miền Nam' : 'Chi nhánh Hà Nội',
      assignedWarehouseIds: modalUserData.assignedWarehouseIds || ['ALL'],
      twoFactorEnabled: modalUserData.twoFactorEnabled ?? false,
      forcePasswordChange: modalUserData.forcePasswordChange ?? false,
      failedLoginAttempts: modalUserData.failedLoginAttempts ?? 0,
      telegramUsername: modalUserData.telegramUsername,
      telegramChatId: modalUserData.telegramChatId,
      zaloPhone: modalUserData.zaloPhone,
      permissions: modalUserData.permissions || roleDef.defaultPermissions,
      sessions: modalUserData.sessions || [],
      createdAt: modalUserData.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
      lastActive: modalUserData.lastActive || 'Chưa đăng nhập',
      notes: modalUserData.notes
    };

    onSaveUser(saved);

    // Add audit entry
    const newAudit: SystemAuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id || 'usr-admin-ductang',
      userName: currentUser?.name || 'Super Admin',
      userRole: currentUser?.role || 'Super Admin',
      ipAddress: '113.190.234.12',
      device: 'MacBook Pro (Chrome)',
      action: modalUserData.id ? 'UPDATE' : 'CREATE',
      module: 'users',
      recordId: saved.id,
      recordCode: saved.employeeCode,
      description: modalUserData.id
        ? `Cập nhật thông tin & phân quyền tài khoản ${saved.name} (${saved.role})`
        : `Tạo mới tài khoản người dùng ${saved.name} (${saved.role})`,
      isCritical: true
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    setIsEditModalOpen(false);
  };

  const handleToggleLockUser = (user: UserAccount) => {
    const newStatus = user.status === 'locked' ? 'active' : 'locked';
    const updated: UserAccount = {
      ...user,
      status: newStatus,
      failedLoginAttempts: newStatus === 'active' ? 0 : user.failedLoginAttempts
    };
    onSaveUser(updated);

    const newAudit: SystemAuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id || 'usr-admin-ductang',
      userName: currentUser?.name || 'Super Admin',
      userRole: currentUser?.role || 'Super Admin',
      ipAddress: '113.190.234.12',
      device: 'MacBook Pro',
      action: 'UPDATE',
      module: 'users',
      recordId: user.id,
      recordCode: user.employeeCode,
      description: `${newStatus === 'locked' ? 'Khóa bảo vệ tài khoản' : 'Mở khóa tài khoản'} ${user.name}`,
      isCritical: true
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const handleRevokeSession = (user: UserAccount, sessionId: string) => {
    const updatedSessions = (user.sessions || []).filter((s) => s.id !== sessionId);
    const updatedUser: UserAccount = {
      ...user,
      sessions: updatedSessions
    };
    onSaveUser(updatedUser);
    if (selectedUser?.id === user.id) {
      setSelectedUser(updatedUser);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1450px] mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Quản Trị Người Dùng & Phân Quyền Đa Cấp
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý tài khoản nhân sự, phân quyền vai trò (RBAC), giới hạn dữ liệu theo kho & giám sát phiên đăng nhập
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddUser}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tài Khoản Nhân Sự</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'users', label: 'Danh Sách Nhân Sự & Tài Khoản', icon: Users, count: users.length },
          { id: 'roles_matrix', label: 'Ma Trận Phân Quyền Chi Tiết', icon: Sliders },
          { id: 'sessions', label: 'Quản Lý Thiết Bị & Phiên Đăng Nhập', icon: Laptop },
          { id: 'audit_logs', label: 'Nhật Ký Bảo Mật & Audit Trail', icon: History, count: auditLogs.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: USER LIST */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, mã NV, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="super_admin">Super Admin</option>
                <option value="ceo">Ban Giám Đốc (CEO)</option>
                <option value="admin">Admin</option>
                <option value="warehouse_manager">Trưởng Kho</option>
                <option value="warehouse_staff">Thủ Kho</option>
                <option value="accountant">Kế Toán</option>
                <option value="sales">Kinh Doanh</option>
                <option value="purchasing">Thu Mua</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-500">
              Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} tài khoản
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Nhân sự / Tài khoản</th>
                    <th className="py-3 px-3">Phòng ban & Chức vụ</th>
                    <th className="py-3 px-3">Vai trò & Quyền hạn</th>
                    <th className="py-3 px-3">Kho được phân quyền</th>
                    <th className="py-3 px-3">Bảo mật (2FA)</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const roleInfo = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.warehouse_staff;
                    const isLocked = user.status === 'locked';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {user.employeeCode && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                                    {user.employeeCode}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                              {user.phone && <div className="text-[10px] text-slate-400">{user.phone}</div>}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{user.department || 'Vận Hành'}</div>
                          <div className="text-[11px] text-slate-500">{user.position || user.roleTitle}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border inline-flex items-center gap-1 ${roleInfo.badgeColor}`}>
                            <Shield className="w-3 h-3" />
                            {roleInfo.name.split('(')[0].trim()}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {user.assignedWarehouseIds?.includes('ALL') ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              Toàn bộ kho (Toàn quốc)
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {user.assignedWarehouseIds?.map((whId) => {
                                const wh = warehouses.find((w) => w.id === whId);
                                return (
                                  <span key={whId} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">
                                    {wh ? wh.name : whId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {user.twoFactorEnabled ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              2FA Đã bật ({user.twoFactorType?.toUpperCase() || 'TOTP'})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] w-fit">
                              Chưa bật 2FA
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {isLocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200 flex items-center gap-1 w-fit">
                              <Lock className="w-3 h-3" />
                              Đang bị khóa
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Hoạt động
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(user)}
                              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                              title="Chỉnh sửa tài khoản & phân quyền"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleLockUser(user)}
                              className={`p-1.5 rounded-xl border transition ${
                                isLocked
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                              }`}
                              title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản bảo mật'}
                            >
                              {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles_matrix' && (
        <div className="space-y-4">
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-blue-900">
            <Sliders className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs">Ma Trận Phân Quyền Chi Tiết Theo Vai Trò (RBAC Architecture):</div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Mỗi vai trò được định nghĩa quyền hạn chặt chẽ trên từng module: 
                <strong> Xem (View), Tạo mới (Create), Sửa (Edit), Xóa (Delete), Phê duyệt (Approve), Xuất file (Export), Điều chỉnh giá vốn (Adjust Cost)</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase">
                    <th className="py-3 px-4">Phân Hệ Nghiệp Vụ (Module)</th>
                    <th className="py-3 px-2 text-center text-rose-700">Super Admin</th>
                    <th className="py-3 px-2 text-center text-amber-800">CEO</th>
                    <th className="py-3 px-2 text-center text-indigo-700">Admin</th>
                    <th className="py-3 px-2 text-center text-blue-700">Trưởng Kho</th>
                    <th className="py-3 px-2 text-center text-cyan-700">Thủ Kho</th>
                    <th className="py-3 px-2 text-center text-emerald-700">Kế Toán</th>
                    <th className="py-3 px-2 text-center text-teal-700">Kinh Doanh</th>
                    <th className="py-3 px-2 text-center text-purple-700">Thu Mua</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MODULE_LIST.map((mod) => (
                    <tr key={mod.key} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{mod.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{mod.description}</div>
                      </td>
                      {(
                        [
                          'super_admin',
                          'ceo',
                          'admin',
                          'warehouse_manager',
                          'warehouse_staff',
                          'accountant',
                          'sales',
                          'purchasing'
                        ] as UserRole[]
                      ).map((r) => {
                        const actions = ROLE_DEFINITIONS[r]?.defaultPermissions?.[mod.key] || [];
                        return (
                          <td key={r} className="py-3 px-2 text-center">
                            {actions.length === 0 ? (
                              <span className="text-slate-300 font-mono">—</span>
                            ) : (
                              <div className="flex flex-wrap items-center justify-center gap-0.5">
                                {actions.map((act) => (
                                  <span
                                    key={act}
                                    className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase"
                                  >
                                    {act}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE DEVICE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-600" />
              <span>Thiết Bị Đang Đăng Nhập Hoạt Động Trên Hệ Thống</span>
            </h2>
            <span className="text-[11px] text-slate-500">Giám sát & thu hồi phiên đăng nhập từ xa</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.flatMap((u) =>
              (u.sessions || []).map((session) => {
                const isMobile = session.deviceType === 'mobile';
                const isTablet = session.deviceType === 'tablet';
                const Icon = isMobile ? Smartphone : isTablet ? Tablet : Laptop;

                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-2xl border transition relative ${
                      session.isCurrent
                        ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300/60'
                        : 'bg-white border-slate-200 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{session.deviceName}</span>
                            {session.isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                                Thiết bị này
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.name} ({u.roleTitle})</div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(u, session.id)}
                          className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Đăng xuất thiết bị này"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Hệ điều hành / Trình duyệt:</span>
                        <span className="font-bold text-slate-700">{session.os} • {session.browser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Địa chỉ IP:</span>
                        <span className="font-mono font-bold text-slate-700">{session.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vị trí ước tính:</span>
                        <span className="text-slate-700">{session.location || 'Việt Nam'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lần cuối hoạt động:</span>
                        <span className="text-indigo-700 font-bold">{session.lastActive}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-xs">
                  Nhật Ký Hoạt Động & Biến Động Dữ Liệu Toàn Hệ Thống (Audit Logs)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {auditLogs.length} bản ghi ghi nhận
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase">
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-3">Người thực hiện</th>
                    <th className="py-3 px-3">Hành động</th>
                    <th className="py-3 px-3">Phân hệ</th>
                    <th className="py-3 px-4">Nội dung chi tiết</th>
                    <th className="py-3 px-3">Thiết bị & IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-indigo-700 font-bold">{log.userRole}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            log.action === 'CREATE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.action === 'UPDATE' || log.action === 'PERMISSION_CHANGE'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : log.action === 'APPROVE'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700 uppercase text-[10px]">
                        {log.module}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{log.description}</div>
                        {(log.beforeData || log.afterData) && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 bg-slate-50 p-1 rounded border border-slate-200">
                            {log.beforeData && <span className="text-rose-600 block">Trước: {log.beforeData}</span>}
                            {log.afterData && <span className="text-emerald-600 block">Sau: {log.afterData}</span>}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                        <div>{log.device}</div>
                        <div className="font-mono text-[10px] text-slate-400">{log.ipAddress}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Create/Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-indigo-700 to-blue-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-base">
                    {modalUserData.id ? 'Cập Nhật Tài Khoản & Phân Quyền' : 'Thêm Mới Nhân Sự & Tài Khoản'}
                  </h3>
                  <p className="text-[11px] text-indigo-100">Cấu hình vai trò, gán chi nhánh/kho và thiết lập bảo mật</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên nhân sự *</label>
                  <input
                    type="text"
                    value={modalUserData.name || ''}
                    onChange={(e) => setModalUserData({ ...modalUserData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email đăng nhập *</label>
                  <input
                    type="email"
                    value={modalUserData.email || ''}
                    onChange={(e) => setModalUserData({ ...modalUserData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã nhân viên (ID)</label>
                  <input
                    type="text"
                    value={modalUserData.employeeCode || ''}
                    onChange={(e) => setModalUserData({ ...modalUserData, employeeCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={modalUserData.phone || ''}
                    onChange={(e) => setModalUserData({ ...modalUserData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai trò hệ thống *</label>
                  <select
                    value={modalUserData.role || 'warehouse_staff'}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      const roleDef = ROLE_DEFINITIONS[newRole];
                      setModalUserData({
                        ...modalUserData,
                        role: newRole,
                        permissions: { ...roleDef.defaultPermissions }
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="super_admin">Super Admin (Tối cao)</option>
                    <option value="ceo">CEO / Ban Giám Đốc</option>
                    <option value="admin">Admin Hệ thống</option>
                    <option value="warehouse_manager">Trưởng Kho</option>
                    <option value="warehouse_staff">Thủ Kho</option>
                    <option value="accountant">Kế Toán & Công Nợ</option>
                    <option value="sales">Kinh Doanh (Sales)</option>
                    <option value="purchasing">Thu Mua & NCC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng ban</label>
                  <input
                    type="text"
                    value={modalUserData.department || ''}
                    onChange={(e) => setModalUserData({ ...modalUserData, department: e.target.value })}
                    placeholder="e.g. Khối Vận Hành & Kho Bãi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chức vụ</label>
                  <input
                    type="text"
                    value={modalUserData.position || ''}
                    onChange={(e) => setModalUserData({ ...modalUserData, position: e.target.value })}
                    placeholder="e.g. Trưởng nhóm Quản lý Tồn kho"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Assigned Warehouse Restriction */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Giới hạn dữ liệu theo Kho (Data-level Restriction) *
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={modalUserData.assignedWarehouseIds?.includes('ALL')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setModalUserData({ ...modalUserData, assignedWarehouseIds: ['ALL'] });
                        } else {
                          setModalUserData({ ...modalUserData, assignedWarehouseIds: ['WH01'] });
                        }
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span>Toàn bộ Kho (ALL)</span>
                  </label>
                  {warehouses.map((wh) => {
                    const isAll = modalUserData.assignedWarehouseIds?.includes('ALL');
                    const isChecked = isAll || modalUserData.assignedWarehouseIds?.includes(wh.id);

                    return (
                      <label key={wh.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          disabled={isAll}
                          checked={isChecked}
                          onChange={(e) => {
                            const current = modalUserData.assignedWarehouseIds?.filter((x) => x !== 'ALL') || [];
                            if (e.target.checked) {
                              setModalUserData({ ...modalUserData, assignedWarehouseIds: [...current, wh.id] });
                            } else {
                              setModalUserData({ ...modalUserData, assignedWarehouseIds: current.filter((x) => x !== wh.id) });
                            }
                          }}
                          className="rounded text-indigo-600 disabled:opacity-50"
                        />
                        <span>{wh.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notification Integrations */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telegram Chat ID (Nhận báo động)</label>
                  <input
                    type="text"
                    value={modalUserData.telegramChatId || ''}
                    onChange={(e) => setModalUserData({ ...modalUserData, telegramChatId: e.target.value })}
                    placeholder="e.g. 992817462"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zalo Phone (Nhận ZNS/OA)</label>
                  <input
                    type="text"
                    value={modalUserData.zaloPhone || ''}
                    onChange={(e) => setModalUserData({ ...modalUserData, zaloPhone: e.target.value })}
                    placeholder="e.g. 0988888999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Security Flags */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={modalUserData.twoFactorEnabled || false}
                    onChange={(e) => setModalUserData({ ...modalUserData, twoFactorEnabled: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Bật xác thực 2 lớp (2FA Security)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={modalUserData.forcePasswordChange || false}
                    onChange={(e) => setModalUserData({ ...modalUserData, forcePasswordChange: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Yêu cầu đổi mật khẩu lần đầu</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-sm transition"
                >
                  {modalUserData.id ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
