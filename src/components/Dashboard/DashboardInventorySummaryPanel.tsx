import React, { useMemo } from 'react';
import { AlertTriangle, ArrowRight, Boxes, CheckCircle2, Layers, Package, TrendingUp, X } from 'lucide-react';
import type { InventoryLayer, Product, StockTransaction } from '../../types';
import { buildInventorySummary } from '../../services/inventorySummary';

export type InventorySummaryMetric =
  | 'all-sku'
  | 'total-stock'
  | 'inventory-val'
  | 'low-stock'
  | 'out-of-stock'
  | 'aged'
  | 'cogs'
  | 'gross-profit';

interface Props {
  metric: InventorySummaryMetric;
  products?: Product[];
  inventoryLots: InventoryLayer[];
  stockTransactions?: StockTransaction[];
  netSales?: number;
  onClose: () => void;
  onViewDetail?: () => void;
}

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`;
const number = (value: number) => new Intl.NumberFormat('vi-VN').format(Number(value) || 0);

const TITLES: Record<InventorySummaryMetric, string> = {
  'all-sku': 'Tổng SKU',
  'total-stock': 'Tồn kho',
  'inventory-val': 'Giá trị FIFO',
  'low-stock': 'Sắp hết hàng',
  'out-of-stock': 'Hết hàng',
  aged: 'Tồn kho lâu ngày',
  cogs: 'COGS',
  'gross-profit': 'Lợi nhuận gộp'
};

export const DashboardInventorySummaryPanel: React.FC<Props> = ({
  metric,
  products = [],
  inventoryLots,
  stockTransactions = [],
  netSales = 0,
  onClose,
  onViewDetail
}) => {
  const summary = useMemo(() => buildInventorySummary({ products, inventoryLots, stockTransactions }), [products, inventoryLots, stockTransactions]);
  const grossProfit = netSales - summary.cogs;
  const value = metric === 'all-sku' ? number(summary.skuCount)
    : metric === 'total-stock' ? number(summary.stockQuantity)
    : metric === 'inventory-val' ? money(summary.fifoValue)
    : metric === 'low-stock' ? number(summary.lowStockSkuCount)
    : metric === 'out-of-stock' ? number(summary.outOfStockSkuCount)
    : metric === 'aged' ? money(summary.agedValue)
    : metric === 'cogs' ? money(summary.cogs)
    : money(grossProfit);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150" aria-label={`Tóm tắt ${TITLES[metric]}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-xl bg-slate-100 p-2"><Package className="h-4 w-4 text-slate-700" /></div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tóm tắt dữ liệu</p>
            <h3 className="truncate text-sm font-bold text-slate-900">{TITLES[metric]}</h3>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Giá trị đã chọn</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Lớp FIFO</p><p className="mt-1 text-lg font-bold text-slate-900">{number(summary.activeLayers)}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Giá trị tồn</p><p className="mt-1 text-lg font-bold text-slate-900">{money(summary.fifoValue)}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">COGS</p><p className="mt-1 text-lg font-bold text-slate-900">{money(summary.cogs)}</p></div>
      </div>

      <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2 sm:px-5 sm:pb-5">
        <div className="rounded-xl border border-slate-100 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><Boxes className="h-4 w-4" /> Top tồn kho</div>
          <div className="space-y-2">
            {summary.topStock.map(row => <div key={row.sku} className="flex items-center justify-between gap-3 text-xs"><span className="truncate text-slate-600">{row.sku}</span><span className="font-semibold text-slate-900">{money(row.fifoValue)}</span></div>)}
            {summary.topStock.length === 0 && <p className="text-xs text-slate-400">Chưa có dữ liệu.</p>}
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><TrendingUp className="h-4 w-4" /> Top COGS</div>
          <div className="space-y-2">
            {summary.topCogs.map(row => <div key={row.sku} className="flex items-center justify-between gap-3 text-xs"><span className="truncate text-slate-600">{row.sku}</span><span className="font-semibold text-slate-900">{money(row.cogs)}</span></div>)}
            {summary.topCogs.length === 0 && <p className="text-xs text-slate-400">Chưa có dữ liệu COGS.</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs">
          {summary.integrity.healthy ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
          <span className={summary.integrity.healthy ? 'text-emerald-700' : 'text-amber-700'}>
            Inventory Integrity: {summary.integrity.healthy ? 'Healthy' : `${summary.integrity.discrepancyCount} sai lệch`}
          </span>
        </div>
        {onViewDetail && <button onClick={onViewDetail} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Xem chi tiết <ArrowRight className="h-3.5 w-3.5" /></button>}
      </div>
    </section>
  );
};
