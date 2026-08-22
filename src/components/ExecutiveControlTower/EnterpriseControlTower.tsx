import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Layers,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Activity,
  Boxes,
  Zap,
  Target,
  FileText,
  Search,
  SlidersHorizontal,
  Send,
  Calendar,
  Sparkles,
  Shield,
  Truck,
  HelpCircle,
  Eye,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area
} from 'recharts';
import {
  EnterpriseExecutiveKpi,
  BusinessFunctionMetric,
  EnterpriseAlert,
  PerformanceTimeSlice,
  INITIAL_EXECUTIVE_KPIS,
  INITIAL_BUSINESS_FUNCTIONS,
  INITIAL_ENTERPRISE_ALERTS,
  INITIAL_TIME_SLICES
} from '../../data/controlTowerData';
import {
  ControlTowerDrillDownDrawer,
  DrillDownTarget
} from './ControlTowerDrillDownDrawer';
import { ProductValueChainOverview } from './ProductValueChainOverview';
import { CustomerLifecycleSummaryWidget } from './CustomerLifecycleSummaryWidget';
import { WorkloadBottleneckMatrix } from './WorkloadBottleneckMatrix';
import { OmniChannelMarketingPerformance } from './OmniChannelMarketingPerformance';
import {
  Order,
  Customer,
  CrmTask,
  InventoryLayer,
  PurchaseOrder,
  CashTransaction,
  UserAccount,
  Warehouse,
  Supplier,
  Product,
  OrgLevel
} from '../../types';
import { formatNumberWithDots } from '../../data/administrativeData';

interface EnterpriseControlTowerProps {
  orders?: Order[];
  customers?: Customer[];
  inventoryLots?: InventoryLayer[];
  crmTasks?: CrmTask[];
  cashTransactions?: CashTransaction[];
  purchaseOrders?: PurchaseOrder[];
  warehouses?: Warehouse[];
  suppliers?: Supplier[];
  products?: Product[];
  users?: UserAccount[];
  currentUser?: UserAccount;
  onNavigateToView?: (view: string, filter?: string) => void;
  onSelectOrder?: (order: Order) => void;
  onSelectCustomer?: (customer: Customer) => void;
}

export const EnterpriseControlTower: React.FC<EnterpriseControlTowerProps> = ({
  orders = [],
  customers = [],
  inventoryLots = [],
  crmTasks = [],
  cashTransactions = [],
  purchaseOrders = [],
  warehouses = [],
  suppliers = [],
  products = [],
  users = [],
  currentUser,
  onNavigateToView,
  onSelectOrder,
  onSelectCustomer
}) => {
  // Global Filters
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedOrgLevel, setSelectedOrgLevel] = useState<OrgLevel>(currentUser?.managementLevel || 'ceo_chairman');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'good' | 'warning' | 'critical'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Live datasets
  const [executiveKpis, setExecutiveKpis] = useState<EnterpriseExecutiveKpi[]>(INITIAL_EXECUTIVE_KPIS);
  const [businessFunctions, setBusinessFunctions] = useState<BusinessFunctionMetric[]>(INITIAL_BUSINESS_FUNCTIONS);
  const [enterpriseAlerts, setEnterpriseAlerts] = useState<EnterpriseAlert[]>(INITIAL_ENTERPRISE_ALERTS);

  // Drilldown Drawer State
  const [drillDownTarget, setDrillDownTarget] = useState<DrillDownTarget | null>(null);

  // Time-slice Chart Data
  const timeSliceData = INITIAL_TIME_SLICES[timePeriod];

  // Dynamic calculations from actual transactions
  const realTimeRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  const realTimeInventoryValue = useMemo(() => {
    return inventoryLots.reduce((sum, l) => {
      const qty = Number(l.quantityRemaining ?? l.remainingQuantity ?? 0) || 0;
      const cost = Number(l.purchasePrice ?? l.costPrice ?? 0) || 0;
      return sum + qty * cost;
    }, 0);
  }, [inventoryLots]);

  const realTimeCustomerDebt = useMemo(() => {
    return customers.reduce((sum, c) => sum + (Number(c.debt) || 0), 0);
  }, [customers]);

  const activeAlertCount = useMemo(() => {
    return enterpriseAlerts.filter((a) => a.status !== 'resolved').length;
  }, [enterpriseAlerts]);

  // Filtered Business Functions
  const filteredFunctions = useMemo(() => {
    return businessFunctions.filter((bf) => {
      const matchSearch =
        !searchTerm ||
        bf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bf.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bf.primaryKpiSummary.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || bf.status === statusFilter;
      const matchDiv = selectedDivision === 'ALL' || bf.category === selectedDivision;

      return matchSearch && matchStatus && matchDiv;
    });
  }, [businessFunctions, searchTerm, statusFilter, selectedDivision]);

  // Handle Delegate Task from Drawer
  const handleDelegateTask = (newTaskData: Partial<CrmTask>) => {
    // Alert user & update local tasks/alerts state if needed
    const alertId = 'alt-task-' + Date.now();
    const newAlert: EnterpriseAlert = {
      id: alertId,
      type: 'overdue_task',
      severity: 'warning',
      title: `[Mới giao] ${newTaskData.title}`,
      description: newTaskData.notes || newTaskData.note || 'Chỉ đạo từ Executive Control Tower',
      impactValue: 'Theo dõi tiến độ',
      department: 'Phòng ban nhận việc',
      pic: newTaskData.assignedTo || 'Chưa gán',
      deadline: newTaskData.dueDate,
      status: 'in_progress',
      linkedEntityType: 'task'
    };

    setEnterpriseAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <div id="enterprise-executive-control-tower" className="space-y-5 pb-12 max-w-[1680px] mx-auto">
      {/* ========================================================================= */}
      {/* 1. CONTROL TOWER HEADER & GLOBAL FILTER TOOLBAR                            */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                BizOne Enterprise OS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Single Source of Truth • Live Real-Time</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-blue-400" />
              <span>ENTERPRISE EXECUTIVE CONTROL TOWER</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
              Trung tâm điều hành hợp nhất toàn diện 16 khối chức năng: Kinh doanh, Marketing, CSKH, Tài chính, Mua hàng,
              Supply Chain, Kho & FIFO, Logistics, Sản xuất, R&D, QA/QC, Bán lẻ, E-Commerce, Nhân sự và Công nghệ.
            </p>
          </div>

          {/* Time Slice Filter Switcher */}
          <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-slate-700 font-bold text-xs self-start lg:self-auto">
            {(['day', 'week', 'month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1.5 rounded-xl transition-all capitalize ${
                  timePeriod === period
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {period === 'day'
                  ? 'Ngày'
                  : period === 'week'
                  ? 'Tuần'
                  : period === 'month'
                  ? 'Tháng'
                  : period === 'quarter'
                  ? 'Quý'
                  : 'Năm'}
              </button>
            ))}
          </div>
        </div>

        {/* Global Multi-Dimension Scope Filter Strip */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* 5-Level Scope */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Cấp Quản Trị (Hierarchy Scope)
            </label>
            <select
              value={selectedOrgLevel}
              onChange={(e) => setSelectedOrgLevel(e.target.value as OrgLevel)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ceo_chairman">Cấp 5: Tổng Giám Đốc / HĐQT (Toàn Công Ty)</option>
              <option value="deputy_ceo">Cấp 4: Phó TGĐ / Lãnh Đạo Khối</option>
              <option value="director">Cấp 3: Giám Đốc Chi Nhánh / Vùng / Nhà Máy</option>
              <option value="team_lead">Cấp 2: Trưởng Phòng / Quản Đốc / Team Lead</option>
              <option value="individual">Cấp 1: Chuyên Viên / Cá Nhân / Nghiệp Vụ</option>
            </select>
          </div>

          {/* Division / Function Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Khối / Phân Hệ Chức Năng
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">Toàn bộ 16 Khối chức năng</option>
              <option value="sales">Khối Kinh Doanh (Sales)</option>
              <option value="marketing">Khối Marketing</option>
              <option value="cskh">Khối CSKH</option>
              <option value="finance">Khối Tài Chính - Kế Toán</option>
              <option value="warehouse">Khối Kho Vận & FIFO</option>
              <option value="production">Khối Sản Xuất & Nhà Máy</option>
              <option value="procurement">Khối Mua Hàng & NCC</option>
              <option value="supply_chain">Khối Supply Chain</option>
              <option value="retail">Khối Bán Lẻ & Showroom</option>
              <option value="ecommerce">Khối Thương Mại Điện Tử</option>
            </select>
          </div>

          {/* Branch / Region Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Chi Nhánh / Điểm Vận Hành
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">Tất cả chi nhánh & Nhà máy</option>
              <option value="HN">Trụ sở & Mega Hub Hà Nội</option>
              <option value="HCM">Chi Nhánh & Kho TP.HCM</option>
              <option value="DN">Chi Nhánh Miền Trung (Đà Nẵng)</option>
              <option value="NM1">Nhà Máy Sản Xuất 1 (Bắc Thăng Long)</option>
              <option value="NM2">Nhà Máy Chế Biến 2 (Tân Bình)</option>
            </select>
          </div>

          {/* Search & Status Quick Filter */}
          <div className="relative">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Tìm kiếm chỉ số & Trạng thái
            </label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm KPI, Khối, PIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white pl-8 pr-3 py-1.5 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-2 py-1.5 text-xs font-semibold"
              >
                <option value="ALL">Tất cả</option>
                <option value="good">✓ Đạt</option>
                <option value="warning">⚠ Cảnh báo</option>
                <option value="critical">🔴 Nguy cơ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE KPI STRIP (12 Core Indicators - All Clickable Drilldown!)     */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>12 CHỈ TIÊU KPI ĐIỀU HÀNH TOÀN DOANH NGHIỆP (EXECUTIVE KPI STRIP)</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-semibold italic">
            Click vào bất kỳ thẻ chỉ số nào để mở Panel phân rã 5 cấp & giao việc
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {executiveKpis.map((kpi) => {
            const isWarning = kpi.status === 'warning';
            const isCritical = kpi.status === 'critical';
            const isExcellent = kpi.status === 'excellent';

            return (
              <button
                key={kpi.id}
                type="button"
                onClick={() => setDrillDownTarget({ type: 'kpi', data: kpi })}
                className={`bg-white rounded-2xl p-3.5 border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between cursor-pointer ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/20'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 truncate group-hover:text-blue-600 transition-colors">
                      {kpi.title}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : isExcellent
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {kpi.achievementRate}%
                    </span>
                  </div>

                  <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {kpi.formattedActual}
                  </div>
                </div>

                <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Plan: <strong>{kpi.formattedPlan}</strong></span>
                    <span
                      className={`font-bold ${
                        kpi.gap < 0 && !kpi.formattedGap.includes('Tiết kiệm')
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {kpi.formattedGap}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : isExcellent
                          ? 'bg-emerald-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(kpi.achievementRate, 100)}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ENTERPRISE PERFORMANCE MATRIX & UNIFIED TREND CHART                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Unified Enterprise Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>DIỄN BIẾN KẾ HOẠCH vs THỰC HIỆN vs DỰ BÁO TOÀN DOANH NGHIỆP</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi đồng thời Doanh thu, Chi phí, Lợi nhuận và Sản lượng thành phẩm theo từng kỳ
              </p>
            </div>

            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-xl">
              Kỳ: <strong className="capitalize">{timePeriod}</strong>
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeSliceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="periodLabel" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  tickFormatter={(val) => (val / 1000000000).toFixed(0) + 'B'}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 110]}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '16px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Tỷ Lệ Đạt') return [`${value}%`, name];
                    return [formatNumberWithDots(value) + ' đ', name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '8px' }} />
                <Bar yAxisId="left" dataKey="planRevenue" name="Kế Hoạch Doanh Thu" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="actualRevenue" name="Thực Hiện Doanh Thu" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="forecastRevenue"
                  name="Dự Báo Run-rate"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#F59E0B' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="achievementRate"
                  name="Tỷ Lệ Đạt"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Centralized Enterprise Alert Center */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>CẢNH BÁO TẬP TRUNG ({activeAlertCount})</span>
            </h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Cần xử lý
            </span>
          </div>

          {/* Alert list */}
          <div className="space-y-2.5 overflow-y-auto max-h-[290px] pr-1">
            {enterpriseAlerts.map((alt) => {
              const isCrit = alt.severity === 'critical';
              const isWarn = alt.severity === 'warning';

              return (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() => setDrillDownTarget({ type: 'alert', data: alt })}
                  className={`w-full p-3 rounded-2xl border text-left transition-all hover:shadow-sm cursor-pointer space-y-1 ${
                    isCrit
                      ? 'border-rose-300 bg-rose-50/30 hover:bg-rose-50/60'
                      : isWarn
                      ? 'border-amber-300 bg-amber-50/30 hover:bg-amber-50/60'
                      : 'border-emerald-200 bg-emerald-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">{alt.title}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 ${
                        isCrit ? 'bg-rose-600 text-white' : isWarn ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {alt.impactValue}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{alt.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>PIC: <strong>{alt.pic}</strong></span>
                    <span className="text-blue-600 font-bold flex items-center gap-0.5">
                      <span>Mở giải pháp</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Click cảnh báo để mở Root Cause và giao việc cho PIC
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PERFORMANCE BY BUSINESS FUNCTION (16 Khối Chức Năng Hợp Nhất)          */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              <span>HIỆU SUẤT TỔNG THỂ 16 KHỐI CHỨC NĂNG (PERFORMANCE BY BUSINESS FUNCTION)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ dữ liệu của tất cả khối/phòng ban đổ về cùng một màn hình điều hành. Click để mở bảng chi tiết.
            </p>
          </div>

          <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            Hiển thị {filteredFunctions.length} / 16 Khối
          </span>
        </div>

        {/* 16 Functional Blocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredFunctions.map((bf) => {
            const isCritical = bf.status === 'critical';
            const isWarning = bf.status === 'warning';
            const isExcellent = bf.status === 'excellent';

            return (
              <button
                key={bf.id}
                type="button"
                onClick={() => setDrillDownTarget({ type: 'function', data: bf })}
                className={`bg-white rounded-3xl p-4 border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between cursor-pointer space-y-3 ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/15'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-black text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      {bf.name}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : isExcellent
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {bf.achievementRate}%
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    Trưởng ban: {bf.headOfDepartment}
                  </div>
                </div>

                {/* Primary KPI compact summary */}
                <div className="bg-slate-50 p-2.5 rounded-2xl text-[11px] font-semibold text-slate-700 leading-snug border border-slate-100">
                  {bf.primaryKpiSummary}
                </div>

                {/* Key indicators list */}
                <div className="space-y-1.5 pt-1">
                  {bf.keyIndicators.slice(0, 2).map((ind, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="truncate max-w-[140px]">{ind.name}:</span>
                      <strong className="text-slate-900">{ind.actual} ({ind.rate}%)</strong>
                    </div>
                  ))}
                </div>

                {/* Footer status & drilldown prompt */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">
                    {bf.alertCount > 0 ? (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>{bf.alertCount} Cảnh báo</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Vận hành tốt</span>
                      </span>
                    )}
                  </span>

                  <span className="text-blue-600 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Phân rã</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. END-TO-END PRODUCT VALUE CHAIN OVERVIEW                                */}
      {/* ========================================================================= */}
      <ProductValueChainOverview
        onSelectStage={(cat) => {
          const matched = businessFunctions.find((b) => b.category === cat);
          if (matched) {
            setDrillDownTarget({ type: 'function', data: matched });
          }
        }}
      />

      {/* ========================================================================= */}
      {/* 6. CUSTOMER LIFECYCLE JOURNEY (4 PHASES)                                  */}
      {/* ========================================================================= */}
      <CustomerLifecycleSummaryWidget
        customers={customers}
        crmTasks={crmTasks}
        onSelectCustomer={onSelectCustomer}
        onNavigateToCrm={() => onNavigateToView && onNavigateToView('crm')}
      />

      {/* ========================================================================= */}
      {/* 7. OMNI-CHANNEL MARKETING & GENSEO STRIP                                 */}
      {/* ========================================================================= */}
      <OmniChannelMarketingPerformance
        onNavigateToGenSeo={() => onNavigateToView && onNavigateToView('genseo')}
      />

      {/* ========================================================================= */}
      {/* 8. WORKLOAD & BOTTLENECK ALLOCATION MATRIX                                */}
      {/* ========================================================================= */}
      <WorkloadBottleneckMatrix
        users={users}
        crmTasks={crmTasks}
        onOpenDelegateTask={(assignee) => {
          const targetKpi = executiveKpis[0];
          setDrillDownTarget({ type: 'kpi', data: targetKpi });
        }}
      />

      {/* ========================================================================= */}
      {/* 9. INTERACTIVE DRILL-DOWN DETAIL DRAWER                                   */}
      {/* ========================================================================= */}
      <ControlTowerDrillDownDrawer
        target={drillDownTarget}
        onClose={() => setDrillDownTarget(null)}
        users={users}
        orders={orders}
        customers={customers}
        inventoryLots={inventoryLots}
        crmTasks={crmTasks}
        cashTransactions={cashTransactions}
        purchaseOrders={purchaseOrders}
        onDelegateTask={handleDelegateTask}
        onSelectOrder={onSelectOrder}
        onSelectCustomer={onSelectCustomer}
      />
    </div>
  );
};
