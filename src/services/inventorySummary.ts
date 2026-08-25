import type { InventoryLayer, Product, StockTransaction } from '../types';
import { inventoryEngine, type StockBalance } from './inventoryEngine';

export type InventorySummary = {
  skuCount: number;
  stockQuantity: number;
  fifoValue: number;
  activeLayers: number;
  lowStockSkuCount: number;
  outOfStockSkuCount: number;
  agedValue: number;
  cogs: number;
  integrity: ReturnType<typeof inventoryEngine.getIntegritySummary>;
  topStock: Array<{ sku: string; productName: string; quantity: number; fifoValue: number }>;
  topCogs: Array<{ sku: string; cogs: number }>;
};

const qty = (layer: InventoryLayer) => Number(layer.quantityRemaining ?? layer.remainingQuantity ?? 0) || 0;
const cost = (layer: InventoryLayer) => Number(layer.purchasePrice ?? layer.costPrice ?? 0) || 0;

export function buildInventorySummary(args: {
  products?: Product[];
  inventoryLots: InventoryLayer[];
  stockTransactions?: StockTransaction[];
  asOf?: string;
  agingDays?: number;
}): InventorySummary {
  const { products = [], inventoryLots, stockTransactions = [] } = args;
  const normalized = inventoryEngine.normalizeLegacyTransactions(stockTransactions);
  const balances = inventoryEngine.buildStockBalances(normalized, inventoryLots);
  const reconciliation = inventoryEngine.reconcile(normalized, inventoryLots, balances);
  const integrity = inventoryEngine.getIntegritySummary(reconciliation);

  const active = inventoryLots.filter(l => qty(l) > 0 && l.status !== 'locked');
  const stockBySku = new Map<string, { productName: string; quantity: number; fifoValue: number }>();

  for (const layer of active) {
    const current = stockBySku.get(layer.sku) || {
      productName: layer.productName,
      quantity: 0,
      fifoValue: 0
    };
    current.quantity += qty(layer);
    current.fifoValue += qty(layer) * cost(layer);
    stockBySku.set(layer.sku, current);
  }

  const lowStockSkuCount = products.filter(p => {
    const stock = stockBySku.get(p.sku)?.quantity ?? 0;
    return stock > 0 && stock <= Number(p.minStock ?? 0);
  }).length;

  const outOfStockSkuCount = products.filter(p => (stockBySku.get(p.sku)?.quantity ?? 0) <= 0).length;
  const now = new Date(args.asOf || new Date().toISOString()).getTime();
  const threshold = Number(args.agingDays ?? 90) * 86400000;
  const agedValue = active.reduce((sum, layer) => {
    const received = new Date(layer.receivedAt || layer.createdAt).getTime();
    return sum + (now - received >= threshold ? qty(layer) * cost(layer) : 0);
  }, 0);

  const cogsBySku = normalized
    .filter(t => t.type === 'SALES_ISSUE' && t.status === 'posted')
    .reduce((map, t) => {
      map.set(t.sku, (map.get(t.sku) || 0) + t.totalCost);
      return map;
    }, new Map<string, number>());

  const topCogs = [...cogsBySku.entries()]
    .map(([sku, cogs]) => ({ sku, cogs }))
    .sort((a, b) => b.cogs - a.cogs)
    .slice(0, 5);

  return {
    skuCount: stockBySku.size,
    stockQuantity: active.reduce((sum, l) => sum + qty(l), 0),
    fifoValue: active.reduce((sum, l) => sum + qty(l) * cost(l), 0),
    activeLayers: active.length,
    lowStockSkuCount,
    outOfStockSkuCount,
    agedValue,
    cogs: [...cogsBySku.values()].reduce((sum, value) => sum + value, 0),
    integrity,
    topStock: [...stockBySku.entries()]
      .map(([sku, value]) => ({ sku, ...value }))
      .sort((a, b) => b.fifoValue - a.fifoValue)
      .slice(0, 5),
    topCogs
  };
}

export function getBalanceForSku(balances: StockBalance[], sku: string, warehouseId?: string) {
  return balances.filter(b => b.sku === sku && (!warehouseId || b.warehouseId === warehouseId));
}
