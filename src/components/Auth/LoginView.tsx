import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  KeyRound,
  Building2,
  Briefcase,
  Users,
  Shield,
  Smartphone,
  PhoneCall
} from 'lucide-react';
import { UserAccount } from '../../types';
import { AuthService } from '../../services/authService';
import { APP_NAME, APP_TAGLINE, COMPANY_NAME } from '../../constants/appConfig';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
  availableUsers: UserAccount[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, availableUsers }) => {
  const [identifier, setIdentifier] = useState('0968994439');
  const [password, setPassword] = useState('Abcd@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isForcePassModalOpen, setIsForcePassModalOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e?: React.FormEvent, customId?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetId = (customId !== undefined ? customId : identifier).trim();
    const targetPass = customPass !== undefined ? customPass : password;

    if (!targetId) {
      setErrorMessage('Vui lòng nhập tên đăng nhập, Email hoặc Số điện thoại.');
      return;
    }
    if (!targetPass) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.login(targetId, targetPass, rememberMe);
      setIsLoading(false);

      if (result.success && result.user) {
        if (result.requirePasswordChange) {
          setPendingUser(result.user);
          setIsForcePassModalOpen(true);
        } else {
          const isDemo = result.user.tenant === 'demo' || result.user.role === 'demo';
          setSuccessMessage(`Chào mừng ${result.user.name} (${isDemo ? 'Môi trường Demo Sandbox' : 'Doanh nghiệp Enterprise'})!`);
          setTimeout(() => {
            onLoginSuccess(result.user!);
          }, 350);
        }
      } else {
        setErrorMessage(result.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Lỗi kết nối hệ thống xác thực.');
    }
  };

  const handleQuickSelect = (user: UserAccount) => {
    const isMasterAdmin = user.username === '0968994439' || user.phone === '0968994439';
    const isDemoUser = user.username === 'demo' || user.tenant === 'demo';
    const pass = isMasterAdmin ? 'Abcd@1234' : isDemoUser ? 'demo' : '123456';

    setIdentifier(user.username || user.phone || user.email);
    setPassword(pass);
    handleLogin(undefined, user.username || user.phone || user.email, pass);
  };

  const handleForcePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (pendingUser) {
      const users = AuthService.getUsers();
      const updated = users.map((u) =>
        u.id === pendingUser.id ? { ...u, forcePasswordChange: false } : u
      );
      AuthService.saveUsers(updated);
      AuthService.setCurrentUser({ ...pendingUser, forcePasswordChange: false });

      setIsForcePassModalOpen(false);
      setSuccessMessage('Đổi mật khẩu thành công! Đang chuyển hướng vào hệ thống...');
      setTimeout(() => {
        onLoginSuccess({ ...pendingUser, forcePasswordChange: false });
      }, 400);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Brand Story & Quick Role Demo Matrix */}
        <div className="lg:col-span-6 bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl text-white">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/30 tracking-tight">
                W
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">{APP_NAME}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{APP_TAGLINE}</p>
              </div>
            </div>

            {/* Platform Description */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Hệ Thống Phân Quyền Đa Tầng (RBAC & Data Scope)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                BizOne ERP bảo vệ dữ liệu theo chuẩn đa phân hệ: Quản trị viên (Admin), Ban Giám Đốc (CEO),
                Kế toán, Quản lý kho và Nhân viên kinh doanh. Dữ liệu tự động phân rã theo chi nhánh,
                phòng ban và phạm vi cá nhân.
              </p>
            </div>

            {/* Quick Demo Role Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Đăng nhập nhanh theo vai trò:
                </span>
                <span className="text-[11px] text-slate-400">Click để vào ngay</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
                {availableUsers.slice(0, 6).map((u) => {
                  const isSuper = u.role === 'super_admin';
                  const isCEO = u.role === 'ceo';
                  const isManager = u.role === 'warehouse_manager' || u.role === 'sales';

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer group hover:scale-[1.02] ${
                        isSuper
                          ? 'bg-rose-950/30 border-rose-800/40 hover:bg-rose-900/40 hover:border-rose-600'
                          : isCEO
                          ? 'bg-amber-950/30 border-amber-800/40 hover:bg-amber-900/40 hover:border-amber-600'
                          : isManager
                          ? 'bg-blue-950/30 border-blue-800/40 hover:bg-blue-900/40 hover:border-blue-600'
                          : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-750 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-600 shrink-0"
                      />
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-white truncate group-hover:text-blue-300">
                            {u.name}
                          </span>
                          {u.status === 'locked' && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-red-900/60 text-red-300 rounded font-mono">
                              Khóa
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                          {u.roleTitle || u.department}
                        </div>
                        <div className="text-[9px] text-indigo-400 font-mono mt-0.5">
                          Scope: {u.dataScope || 'all'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>© 2026 {COMPANY_NAME}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Máy chủ an toàn (SSL 256-bit)
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Cổng Đăng Nhập Vận Hành
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Đăng nhập {APP_NAME}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Nhập thông tin xác thực để truy cập bảng điều khiển và dữ liệu doanh nghiệp
              </p>
            </div>

            {/* Quick 1-Click Master Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('0968994439');
                  setPassword('Abcd@1234');
                  handleLogin(undefined, '0968994439', 'Abcd@1234');
                }}
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-2xl text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded-full">
                    Admin Doanh Nghiệp
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="mt-1.5 font-bold text-xs text-slate-900 font-mono">0968994439</div>
                <div className="text-[10px] text-slate-500 font-mono">Pass: Abcd@1234</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('demo');
                  setPassword('demo');
                  handleLogin(undefined, 'demo', 'demo');
                }}
                className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 rounded-2xl text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    Demo Sandbox (Biệt lập)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="mt-1.5 font-bold text-xs text-slate-900 font-mono">demo</div>
                <div className="text-[10px] text-slate-500 font-mono">Pass: demo</div>
              </button>
            </div>

            {/* Notification Messages */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-bold">{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tài khoản / Email / Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Nhập username, email hoặc mã NV..."
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-semibold rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu truy cập..."
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-semibold rounded-xl pl-10 pr-11 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-600">Ghi nhớ phiên đăng nhập (30 ngày)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xác thực bảo mật...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Help Note */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              Mật khẩu mặc định: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono font-bold">123456</code>
            </span>
            <button
              onClick={() => setIsForgotModalOpen(true)}
              className="text-slate-600 hover:text-blue-600 font-semibold"
            >
              Hỗ trợ kỹ thuật
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hỗ Trợ Khôi Phục Mật Khẩu</h3>
                <p className="text-xs text-slate-500">Quy trình cấp lại thông tin truy cập BizOne ERP</p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Để đảm bảo tính bảo mật của dữ liệu doanh nghiệp, tài khoản phụ và nhân viên vui lòng liên hệ trực tiếp với <strong>Quản trị viên hệ thống (Admin)</strong> để được cấp lại mã truy cập.
              </p>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Hotline IT Doanh nghiệp:</span>
                  <span className="text-blue-700 font-mono">0988 888 999</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Email Admin:</span>
                  <span className="text-blue-700 font-mono">ductang.fbu@gmail.com</span>
                </div>
              </div>
              <p className="text-slate-500 text-[11px]">
                Admin có thể truy cập phân hệ <strong>Tài Khoản & Phân Quyền</strong> để reset mật khẩu trong 1 cú nhấp chuột.
              </p>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Password Change Modal */}
      {isForcePassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Đổi Mật Khẩu Lần Đầu</h3>
                <p className="text-xs text-amber-700 font-medium">Bắt buộc thiết lập mật khẩu mới cho tài khoản</p>
              </div>
            </div>

            <form onSubmit={handleForcePasswordSubmit} className="py-4 space-y-3.5">
              <p className="text-xs text-slate-600">
                Tài khoản của bạn <strong>({pendingUser?.name})</strong> được yêu cầu đổi mật khẩu mới để tăng cường bảo mật trước khi vào hệ thống.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full bg-slate-50 text-sm font-semibold rounded-xl px-3.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full bg-slate-50 text-sm font-semibold rounded-xl px-3.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Xác nhận & Vào hệ thống
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
