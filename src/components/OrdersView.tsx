import React, { useMemo, useState } from 'react';
import { Download, Plus, Search, X } from 'lucide-react';
import { Order } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onOpenCreateOrder: () => void;
  onSelectOrder: (order: Order) => void;
  onOpenVietQr: (order: Order) => void;
}

const statusLabel: Record<Order['status'], string> = {
  completed: 'Hoàn thành',
  shipping: 'Đang giao',
  processing: 'Chờ xử lý',
  cancelled: 'Đã hủy'
};

const paymentLabel: Record<string, string> = {
  vietqr: 'VietQR',
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  credit: 'Công nợ'
};

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders = [],
  onOpenCreateOrder,
  onSelectOrder,
  onOpenVietQr
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = !q ||
      order.code.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.items?.some((item) =>
        item.productName.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q)
      );

    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;
    const orderDate = order.createdAt.substring(0, 10);
    const matchStart = !startDate || orderDate >= startDate;
    const matchEnd = !endDate || orderDate <= endDate;

    return matchSearch && matchStatus && matchPayment && matchStart && matchEnd;
  }), [orders, searchTerm, statusFilter, paymentFilter, startDate, endDate]);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalCogs = filteredOrders.reduce((sum, order) => sum + (order.cogs || 0), 0);
  const totalGrossProfit = filteredOrders.reduce(
    (sum, order) => sum + (order.grossProfit ?? order.totalAmount - (order.cogs || 0)),
    0
  );
  const avgMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasFilters = Boolean(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || startDate || endDate);
  const formatVND = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-5 lg:p-6 space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">Đơn hàng</h1>
          <div className="mt-1 text-xs text-slate-500">{filteredOrders.length} đơn</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('Xuất danh sách đơn hàng sang Excel')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.7} />
            Xuất Excel
          </button>
          <button
            type="button"
            id="btn-new-order-view"
            onClick={onOpenCreateOrder}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--bizone-accent, #0f172a)' }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
            Tạo đơn
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 border-y border-slate-200 bg-white">
        {[
          ['Doanh thu', formatVND(totalRevenue)],
          ['COGS', formatVND(totalCogs)],
          ['Lợi nhuận gộp', formatVND(totalGrossProfit)],
          ['Biên gộp', `${avgMargin.toFixed(1)}%`]
        ].map(([label, value], index) => (
          <div key={label} className={`px-4 py-3 ${index > 0 ? 'border-l border-slate-200' : ''}`}>
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-1 text-base sm:text-lg font-semibold tabular-nums text-slate-900">{value}</div>
          </div>
        ))}
      </section>

      <section className="border border-slate-200 bg-white rounded-lg p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" strokeWidth={1.7} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Mã đơn, khách hàng, sản phẩm, SKU"
              className="w-full h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-md bg-white outline-none focus:border-[var(--bizone-accent)]"
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-8 px-2.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 outline-none">
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="shipping">Đang giao</option>
            <option value="processing">Chờ xử lý</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="h-8 px-2.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 outline-none">
            <option value="all">Tất cả thanh toán</option>
            <option value="vietqr">VietQR</option>
            <option value="cash">Tiền mặt</option>
            <option value="bank_transfer">Chuyển khoản</option>
            <option value="credit">Công nợ</option>
          </select>
          <div className="flex gap-2">
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="min-w-0 flex-1 h-8 px-2 text-xs border border-slate-200 rounded-md bg-white" aria-label="Từ ngày" />
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="min-w-0 flex-1 h-8 px-2 text-xs border border-slate-200 rounded-md bg-white" aria-label="Đến ngày" />
          </div>
        </div>
        {hasFilters && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">Đang lọc dữ liệu</span>
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900">
              <X className="w-3 h-3" /> Xóa lọc
            </button>
          </div>
        )}
      </section>

      <section className="border border-slate-200 bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Mã đơn</th>
                <th className="px-4 py-2.5 text-left font-medium">Ngày</th>
                <th className="px-4 py-2.5 text-left font-medium">Khách hàng</th>
                <th className="px-4 py-2.5 text-right font-medium">Doanh thu</th>
                <th className="px-4 py-2.5 text-right font-medium">COGS</th>
                <th className="px-4 py-2.5 text-right font-medium">Lợi nhuận</th>
                <th className="px-4 py-2.5 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-2.5 text-left font-medium">Thanh toán</th>
                <th className="px-4 py-2.5 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const cogs = order.cogs || 0;
                const profit = order.grossProfit ?? order.totalAmount - cogs;
                const margin = order.totalAmount > 0 ? (profit / order.totalAmount) * 100 : 0;
                return (
                  <tr key={order.id} onClick={() => onSelectOrder(order)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{order.code}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{order.createdAt}</td>
                    <td className="px-4 py-3 text-slate-800">
                      <div className="font-medium">{order.customerName}</div>
                      {order.customerPhone && <div className="mt-0.5 text-[10px] text-slate-400">{order.customerPhone}</div>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">{formatVND(order.totalAmount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatVND(cogs)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <div className="font-medium text-slate-900">{formatVND(profit)}</div>
                      <div className="text-[10px] text-slate-400">{margin.toFixed(1)}%</div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{statusLabel[order.status]}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.paymentMethod === 'vietqr' ? (
                        <button type="button" onClick={(event) => { event.stopPropagation(); onOpenVietQr(order); }} className="font-medium hover:underline" style={{ color: 'var(--bizone-accent, #0f172a)' }}>
                          {paymentLabel[order.paymentMethod]}
                        </button>
                      ) : paymentLabel[order.paymentMethod] || order.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={(event) => { event.stopPropagation(); onSelectOrder(order); }} className="text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:underline">Chi tiết</button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">Không có đơn hàng phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
