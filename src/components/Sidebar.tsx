import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Target,
  Calculator,
  FileText,
  Package,
  Users,
  TrendingDown,
  BookOpen,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
  ScrollText,
  Truck,
  ArrowUpRight,
  ArrowRightLeft,
  ClipboardCheck,
  Layers,
  Layers3,
  FileSpreadsheet,
  Building2,
  Warehouse as WarehouseIcon,
  QrCode,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  lowStockCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  lowStockCount = 5,
  isOpen = false,
  onClose
}) => {
  // Collapsible state for individual module sections
  const [collapsedSections, setCollapsedSections] = useState<{
    main: boolean;
    warehouse: boolean;
    management: boolean;
    finance: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('sheetstore_sidebar_modules');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { main: false, warehouse: false, management: false, finance: false };
  });

  // State for collapsing entire sidebar on desktop (compact mode)
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sheetstore_sidebar_compact');
      return saved === 'true';
    } catch {}
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheetstore_sidebar_modules', JSON.stringify(collapsedSections));
    } catch {}
  }, [collapsedSections]);

  useEffect(() => {
    try {
      localStorage.setItem('sheetstore_sidebar_compact', isCompact.toString());
    } catch {}
  }, [isCompact]);

  const toggleSection = (section: 'main' | 'warehouse' | 'management' | 'finance') => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAllSections = () => {
    const allCollapsed =
      collapsedSections.main &&
      collapsedSections.warehouse &&
      collapsedSections.management &&
      collapsedSections.finance;
    setCollapsedSections({
      main: !allCollapsed,
      warehouse: !allCollapsed,
      management: !allCollapsed,
      finance: !allCollapsed
    });
  };

  const handleNavClick = (view: ViewMode) => {
    onSelectView(view);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Mobile Drawer */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between h-full select-none transform transition-all duration-300 ease-in-out md:static md:translate-x-0 md:h-screen md:sticky md:top-0 md:z-30 shrink-0 ${
          isOpen ? 'translate-x-0 shadow-2xl w-72 max-w-[85vw]' : '-translate-x-full md:shadow-none'
        } ${isCompact ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Brand Header & Collapse Toggle */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 cursor-pointer ${isCompact ? 'md:justify-center md:w-full' : ''}`}
            onClick={() => handleNavClick('dashboard')}
            title="BizOne Enterprise ERP"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-sm tracking-tighter shrink-0 hover:opacity-90 transition-opacity">
              B
            </div>
            {!isCompact && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
                    BizOne
                  </span>
                </div>
                <div className="text-[10px] font-bold tracking-wider text-blue-600 uppercase leading-none">
                  ENTERPRISE ERP
                </div>
              </div>
            )}
          </div>

          {/* Desktop Toggle Compact / Expand Sidebar Button */}
          {!isCompact && (
            <button
              id="btn-toggle-compact-desktop"
              onClick={() => setIsCompact(true)}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Thu gọn thanh bên"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Close button for mobile drawer */}
          <button
            id="btn-close-sidebar-mobile"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
            title="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Expand All / Collapse All quick control when in full mode */}
        {!isCompact && (
          <div className="hidden md:flex items-center justify-between px-4 pt-2.5 pb-1 text-[11px] text-slate-400">
            <span>Danh mục module</span>
            <button
              onClick={toggleAllSections}
              className="hover:text-blue-600 font-medium transition-colors cursor-pointer"
            >
              {collapsedSections.main &&
              collapsedSections.warehouse &&
              collapsedSections.management &&
              collapsedSections.finance
                ? 'Mở tất cả'
                : 'Thu gọn hết'}
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 sm:px-3 py-3 space-y-4 custom-scrollbar">
          {/* 1. Module Bán Hàng (Chính) */}
          <div>
            {!isCompact ? (
              <button
                id="btn-toggle-module-main"
                onClick={() => toggleSection('main')}
                className="w-full px-2.5 py-1.5 mb-1 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 hover:bg-slate-100/70 rounded-lg transition-colors group"
                title="Bấm để thu gọn/mở rộng Bán Hàng"
              >
                <span className="flex items-center gap-1.5">
                  <span>BÁN HÀNG</span>
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 transition-transform">
                  {collapsedSections.main ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            ) : (
              <div className="hidden md:block my-2 border-t border-slate-100" />
            )}

            {(!collapsedSections.main || isCompact) && (
              <div className="space-y-1">
                <button
                  id="nav-dashboard"
                  onClick={() => handleNavClick('dashboard')}
                  title="Enterprise Executive Control Tower (Trung tâm điều hành hợp nhất toàn doanh nghiệp)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'dashboard'
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCompact && (
                    <div className="flex items-center justify-between w-full">
                      <span>Control Tower</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.2 rounded border border-blue-200">
                        16 KHỐI
                      </span>
                    </div>
                  )}
                </button>

                <button
                  id="nav-enterprise-planning"
                  onClick={() => handleNavClick('enterprise-planning')}
                  title="Kế Hoạch & Quản Trị KPI Doanh Nghiệp (BM01.QC11-EWH)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'enterprise-planning'
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isCompact && (
                    <div className="flex items-center justify-between w-full">
                      <span>Kế Hoạch & KPI</span>
                      <span className="text-[9px] bg-amber-400/20 text-amber-600 font-extrabold px-1.5 py-0.2 rounded border border-amber-300">
                        BM01
                      </span>
                    </div>
                  )}
                </button>

                <button
                  id="nav-pos"
                  onClick={() => handleNavClick('pos')}
                  title="POS Thu Ngân (Bán hàng nhanh)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'pos'
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Calculator className="w-4 h-4 shrink-0" />
                  {!isCompact && (
                    <>
                      <span>POS Thu Ngân</span>
                      <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                        FIFO
                      </span>
                    </>
                  )}
                </button>

                <button
                  id="nav-orders"
                  onClick={() => handleNavClick('orders')}
                  title="Đơn Bán Hàng (Quản lý chứng từ)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'orders'
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Đơn Bán Hàng</span>}
                </button>

                <button
                  id="nav-crm"
                  onClick={() => handleNavClick('crm')}
                  title="Khách Hàng CRM"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'crm'
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Khách Hàng CRM</span>}
                </button>

                <button
                  id="nav-suppliers"
                  onClick={() => handleNavClick('suppliers')}
                  title="Nhà Cung Cấp (Đối tác & MST)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'suppliers'
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  {!isCompact && (
                    <div className="flex items-center justify-between w-full">
                      <span>Nhà Cung Cấp</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                        MST
                      </span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 2. Nhóm Menu KHO (FIFO Engine) */}
          <div>
            {!isCompact ? (
              <button
                id="btn-toggle-module-warehouse"
                onClick={() => toggleSection('warehouse')}
                className="w-full px-2.5 py-1.5 mb-1 flex items-center justify-between text-[11px] font-bold text-blue-700 uppercase tracking-wider hover:text-blue-900 hover:bg-blue-50/70 rounded-lg transition-colors group"
                title="Bấm để thu gọn/mở rộng Quản lý Kho FIFO"
              >
                <span className="flex items-center gap-1.5">
                  <WarehouseIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>QUẢN LÝ KHO (FIFO)</span>
                </span>
                <span className="text-blue-400 group-hover:text-blue-600 transition-transform">
                  {collapsedSections.warehouse ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            ) : (
              <div className="hidden md:block my-2 border-t border-slate-100" />
            )}

            {(!collapsedSections.warehouse || isCompact) && (
              <div className="space-y-1">
                {/* 1. Dashboard Kho */}
                <button
                  id="nav-warehouse-dashboard"
                  onClick={() => handleNavClick('warehouse-dashboard')}
                  title="Dashboard Kho (Tổng quan FIFO)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'warehouse-dashboard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Boxes className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Dashboard Kho</span>}
                </button>

                {/* 2. Sản phẩm & SKU */}
                <button
                  id="nav-inventory"
                  onClick={() => handleNavClick('inventory')}
                  title="Danh mục Sản phẩm & SKU"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0 relative' : ''
                  } ${
                    currentView === 'inventory'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  {!isCompact ? (
                    <>
                      <span>Sản phẩm & Tồn kho</span>
                      {lowStockCount > 0 && (
                        <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                          {lowStockCount}
                        </span>
                      )}
                    </>
                  ) : (
                    lowStockCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
                    )
                  )}
                </button>

                {/* 2b. Định nghĩa Variant SKU (Master Data) */}
                <button
                  id="nav-variant-definitions"
                  onClick={() => handleNavClick('variant-definitions')}
                  title="Định nghĩa Variant SKU (Master Data - Sản phẩm & Biến thể)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'variant-definitions'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Layers3 className="w-4 h-4 shrink-0" />
                  {!isCompact && (
                    <div className="flex items-center justify-between w-full">
                      <span>Định Nghĩa SKU</span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">
                        Master
                      </span>
                    </div>
                  )}
                </button>

                {/* 3. Nhập kho (PO & Lô) */}
                <button
                  id="nav-purchasing"
                  onClick={() => handleNavClick('purchasing')}
                  title="Nhập Hàng (PO & Lô FIFO)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'purchasing'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Truck className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Nhập Kho (PO)</span>}
                </button>

                {/* 4. Xuất kho */}
                <button
                  id="nav-warehouse-issues"
                  onClick={() => handleNavClick('warehouse-issues')}
                  title="Phiếu Xuất Kho (FIFO Deduction)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'warehouse-issues'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Xuất Kho</span>}
                </button>

                {/* 5. Chuyển kho */}
                <button
                  id="nav-warehouse-transfers"
                  onClick={() => handleNavClick('warehouse-transfers')}
                  title="Phiếu Chuyển Kho"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'warehouse-transfers'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Chuyển Kho</span>}
                </button>

                {/* 6. Kiểm kê */}
                <button
                  id="nav-warehouse-stocktakes"
                  onClick={() => handleNavClick('warehouse-stocktakes')}
                  title="Phiếu Kiểm Kê"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'warehouse-stocktakes'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Kiểm Kê Kho</span>}
                </button>

                {/* 7. Lô hàng / FIFO */}
                <button
                  id="nav-warehouse-fifo-lots"
                  onClick={() => handleNavClick('warehouse-fifo-lots')}
                  title="Lô Hàng / Lớp FIFO"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'warehouse-fifo-lots'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Lô Hàng / FIFO</span>}
                </button>

                {/* 8. Lịch sử biến động / Thẻ kho */}
                <button
                  id="nav-stockcards"
                  onClick={() => handleNavClick('stockcards')}
                  title="Thẻ Kho (Lịch sử biến động)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'stockcards'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ScrollText className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Thẻ Kho (Biến Động)</span>}
                </button>

                {/* 9. Báo cáo kho */}
                <button
                  id="nav-warehouse-reports"
                  onClick={() => handleNavClick('warehouse-reports')}
                  title="Báo Cáo Kho (NXT, FIFO, Lợi Nhuận)"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'warehouse-reports'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Báo Cáo Kho</span>}
                </button>
              </div>
            )}
          </div>

          {/* 3. Tài Chính & AI */}
          <div>
            {!isCompact ? (
              <button
                id="btn-toggle-module-finance"
                onClick={() => toggleSection('finance')}
                className="w-full px-2.5 py-1.5 mb-1 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 hover:bg-slate-100/70 rounded-lg transition-colors group"
                title="Bấm để thu gọn/mở rộng Module Tài Chính & AI"
              >
                <span className="flex items-center gap-1.5">
                  <span>TÀI CHÍNH & AI</span>
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 transition-transform">
                  {collapsedSections.finance ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            ) : (
              <div className="hidden md:block my-2 border-t border-slate-100" />
            )}

            {(!collapsedSections.finance || isCompact) && (
              <div className="space-y-1">
                <button
                  id="nav-cashflow"
                  onClick={() => handleNavClick('cashflow')}
                  title="Sổ Quỹ Thu/Chi & Dòng tiền"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'cashflow'
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Sổ Quỹ Thu/Chi</span>}
                </button>

                <button
                  id="nav-banking"
                  onClick={() => handleNavClick('banking')}
                  title="Tài Khoản Ngân Hàng & Cấu Hình VietQR"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'banking'
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  {!isCompact && (
                    <div className="flex items-center justify-between w-full">
                      <span>Tài Khoản & VietQR</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                        24/7
                      </span>
                    </div>
                  )}
                </button>

                <button
                  id="nav-pnl"
                  onClick={() => handleNavClick('pnl')}
                  title="Báo Cáo P&L & Lợi Nhuận"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'pnl'
                      ? 'bg-[#1877F2] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  {!isCompact && <span>Báo Cáo P&L</span>}
                </button>

                <button
                  id="nav-ai-assistant"
                  onClick={() => handleNavClick('ai-assistant')}
                  title="AI Assistant (Trợ lý điều hành)"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    isCompact ? 'md:justify-center md:px-0' : ''
                  } ${
                    currentView === 'ai-assistant'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                    {!isCompact && <span>AI Assistant</span>}
                  </div>
                  {!isCompact && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#10B981] text-white px-2 py-0.5 rounded-full">
                      BETA
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Footer Actions & Expand Toggle when compact */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          {/* If compact, show Expand button */}
          {isCompact && (
            <button
              id="btn-expand-sidebar-desktop"
              onClick={() => setIsCompact(false)}
              className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all mb-1"
              title="Mở rộng thanh bên"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          <button
            id="nav-users-roles"
            onClick={() => handleNavClick('users-roles')}
            title="Quản lý Tài Khoản, Phân Quyền & Phiên Đăng Nhập"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isCompact ? 'md:justify-center md:px-0' : ''
            } ${
              currentView === 'users-roles'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {!isCompact && <span>Tài Khoản & Phân Quyền</span>}
          </button>

          <button
            id="nav-settings"
            onClick={() => handleNavClick('settings')}
            title="Cài đặt hệ thống"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isCompact ? 'md:justify-center md:px-0' : ''
            } ${
              currentView === 'settings'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500 shrink-0" />
            {!isCompact && <span>Cài đặt</span>}
          </button>

          <button
            id="nav-logout"
            onClick={() => alert('Đăng xuất thành công!')}
            title="Đăng xuất"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all ${
              isCompact ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-red-600 shrink-0" />
            {!isCompact && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

