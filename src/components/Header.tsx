import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Plus,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';

import { UserAccount } from '../types';

interface HeaderProps {
  onOpenCreateOrder: () => void;
  onOpenCommandPalette: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  unreadAlertsCount?: number;
  onToggleMobileMenu?: () => void;
  currentUser?: UserAccount;
  users?: UserAccount[];
  onChangeCurrentUser?: (user: UserAccount) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateOrder,
  onOpenCommandPalette,
  searchTerm,
  onSearchChange,
  unreadAlertsCount = 2,
  onToggleMobileMenu,
  currentUser,
  users = [],
  onChangeCurrentUser
}) => {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs gap-2 sm:gap-4">
      {/* Left: Mobile Hamburger Menu & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        {/* Hamburger button for mobile screens */}
        <button
          id="btn-hamburger-menu"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden transition-colors focus:outline-none shrink-0"
          aria-label="Mở menu thanh bên"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div
          onClick={onOpenCommandPalette}
          className="relative flex items-center cursor-pointer group flex-1"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 sm:left-3.5 pointer-events-none group-hover:text-blue-500 transition-colors" />
          <input
            type="text"
            readOnly
            value={searchTerm}
            placeholder="Tìm kiếm chứng từ, hàng hoá..."
            className="w-full bg-slate-50 hover:bg-slate-100/80 text-xs sm:text-sm rounded-xl pl-8 sm:pl-10 pr-10 sm:pr-14 py-1.5 sm:py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 cursor-pointer transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Google Workspace Integration Status (hidden on mobile and tablet) */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="font-semibold text-slate-700">Sheet Đồng bộ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-all"
            title="Thông báo"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="font-bold text-sm text-slate-800">Thông báo hệ thống</span>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">Đánh dấu đã đọc</span>
              </div>
              <div className="space-y-2 mt-2">
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Cảnh báo tồn kho Thép tấm 5 ly
                  </div>
                  <p className="text-amber-800 text-[11px]">Chỉ còn 180kg trong kho (mức tối thiểu 500kg).</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Đơn ORD-2023-1024 đã thanh toán
                  </div>
                  <p className="text-emerald-800 text-[11px]">CTY CP Vạn Phát đã thanh toán 12.500.000 đ qua VietQR.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Support Help (hidden on small screen) */}
        <button
          id="btn-help"
          onClick={() => alert('BizOne ERP Hotline Hỗ Trợ 24/7: 1900 6868 (Phím 1 cho Kỹ thuật, Phím 2 cho Kế toán).')}
          className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span className="font-medium">Hỗ trợ</span>
        </button>

        {/* Primary Action: Tạo đơn mới */}
        <button
          id="btn-create-order-header"
          onClick={onOpenCreateOrder}
          className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#0F172A] hover:bg-slate-800 active:scale-98 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Tạo đơn mới</span>
          <span className="sm:hidden">Tạo đơn</span>
        </button>

        {/* User Profile Avatar & Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 focus:outline-none cursor-pointer group"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 transition-all shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                {currentUser?.name || 'Đức Tăng'}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold leading-tight mt-0.5 truncate max-w-[130px]">
                {currentUser?.roleTitle || 'Super Admin'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block group-hover:text-slate-700" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-xl mb-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{currentUser?.name || 'Đức Tăng'}</p>
                    <p className="text-[11px] text-blue-700 font-medium truncate">{currentUser?.roleTitle || 'Chủ tịch HĐQT'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser?.department}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Phạm vi: <strong className="text-slate-700">{currentUser?.dataScope || 'company_wide'}</strong></span>
                  <span>Cấp: <strong className="text-slate-700">{currentUser?.managementLevel || 'ceo_chairman'}</strong></span>
                </div>
              </div>

              {/* Fast User Switcher for Hierarchy & RBAC testing */}
              <div className="py-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-blue-500" />
                  <span>Chuyển đổi Tài Khoản / Cấp Bậc:</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {users.map((u) => {
                    const isCurrent = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onChangeCurrentUser?.(u);
                          setShowProfileDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={u.avatar}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                          <span className="truncate">{u.name}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isCurrent ? 'bg-blue-200/60 text-blue-900' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.managementLevel || u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
