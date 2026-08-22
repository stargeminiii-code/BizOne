import React, { useState } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  QrCode,
  Save,
  CheckCircle,
  FileSpreadsheet,
  RefreshCw,
  Lock,
  Globe,
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { ROLE_DEFINITIONS } from '../data/userData';
import { UserAccountModal } from './Modals/UserAccountModal';
import { APP_NAME, APP_TAGLINE, COMPANY_NAME } from '../constants/appConfig';

interface SettingsViewProps {
  users?: UserAccount[];
  onSaveUser?: (user: UserAccount) => void;
  onDeleteUser?: (userId: string) => void;
  currentUser?: UserAccount;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  users = [],
  onSaveUser,
  onDeleteUser,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'vietqr' | 'users' | 'sheets'>('company');
  const [storeName, setStoreName] = useState('HỘ KINH DOANH VŨ ĐỨC ĐĂNG KHÔI');
  const [taxNumber, setTaxNumber] = useState('022094001577');
  const [address, setAddress] = useState('Số 18, ngách 28/9, phố Chu Huy Mân, phường Phúc Lợi, quận Long Biên, Hà Nội');
  const [bankAccount, setBankAccount] = useState('999988886666');
  const [bankName, setBankName] = useState('MBBank (Ngân hàng TMCP Quân Đội)');
  const [accountHolder, setAccountHolder] = useState('VU DUC DANG KHOI');
  const [isSaved, setIsSaved] = useState(false);

  // User management state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1250px] mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Cài Đặt Hệ Thống {APP_NAME}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              v2.8 Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị thông tin doanh nghiệp, tài khoản thụ hưởng VietQR, phân quyền tài khoản & Google Sheets
          </p>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'company'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Doanh nghiệp</span>
          </button>

          <button
            onClick={() => setActiveTab('vietqr')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'vietqr'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>VietQR Ngân hàng</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thành viên & Phân quyền ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'sheets'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Đã lưu thành công cấu hình hệ thống ERP vào cơ sở dữ liệu!</span>
        </div>
      )}

      {/* TAB 1: Company Profile */}
      {activeTab === 'company' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Thông tin Doanh nghiệp & Xuất Hóa Đơn VAT</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên đơn vị kinh doanh</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã số thuế (MST)</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Địa chỉ trụ sở / Kho chính</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thông tin doanh nghiệp</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: VietQR Configuration */}
      {activeTab === 'vietqr' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Cấu hình Ngân hàng Thụ hưởng VietQR</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngân hàng thụ hưởng</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Số tài khoản ngân hàng</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full text-xs font-mono font-bold border border-slate-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>Lưu cấu hình VietQR</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: User Accounts & Roles Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span>Danh sách Nhân sự & Nhóm quyền hạn ERP</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Tài khoản đăng nhập được bảo mật theo email, phân quyền chi tiết cho 10 phân hệ nghiệp vụ.
                </p>
              </div>

              <button
                onClick={() => {
                  setUserToEdit(null);
                  setIsUserModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm thành viên mới</span>
              </button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {users.map((usr) => {
                const roleDef = ROLE_DEFINITIONS[usr.role] || ROLE_DEFINITIONS.custom;
                const isSuperAdmin = usr.role === 'admin';

                return (
                  <div
                    key={usr.id}
                    className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-4 transition-all duration-150 flex flex-col justify-between space-y-3 group"
                  >
                    {/* Top Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                            alt={usr.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                              <span>{usr.name}</span>
                              {usr.status === 'active' ? (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Đang hoạt động" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" title="Tạm dừng" />
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono">{usr.email}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleDef.badgeColor}`}
                        >
                          {roleDef.name.split(' (')[0]}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
                        {usr.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{usr.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{usr.branchName || 'Tổng kho Hà Nội'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <KeyRound className="w-3 h-3" />
                          <span>Hoạt động: {usr.lastActive || 'Gần đây'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">
                        {Object.values(usr.permissions || {}).flat().length} quyền được cấp
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setUserToEdit(usr);
                            setIsUserModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Chỉnh sửa phân quyền"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {!isSuperAdmin && onDeleteUser && (
                          <button
                            onClick={() => setUserToDelete(usr)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Xóa tài khoản này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Google Sheets */}
      {activeTab === 'sheets' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Đồng bộ 2 chiều với Google Sheets</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              ĐANG HOẠT ĐỘNG
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-extrabold text-slate-900 text-xs">Sheet: "BizOne_ERP_Data_2024.xlsx"</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Tự động ghi nhận đơn bán hàng, phiếu thu chi và tồn kho vào bảng tính Google Drive.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('Đã đồng bộ hóa 142 đơn hàng và 9 mã SKU với Google Sheets thành công!')}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đồng bộ ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* User Account Modal */}
      <UserAccountModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
        onSaveUser={(u) => {
          if (onSaveUser) onSaveUser(u);
        }}
      />

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa tài khoản</h3>
                <p className="text-slate-500 text-[11px]">Hành động này sẽ thu hồi toàn bộ quyền truy cập</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa thành viên <strong>{userToDelete.name}</strong> ({userToDelete.email}) khỏi hệ thống ERP không?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (onDeleteUser) onDeleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold shadow-md shadow-rose-600/20"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

