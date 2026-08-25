import type { InventoryLayer, StockTransaction } from '../types';

export type InventoryTransactionType =
  | 'PURCHASE_RECEIPT'
  | 'SALES_ISSUE'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'PURCHASE_RETURN'
  | 'SALES_RETURN'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'STOCKTAKE_ADJUSTMENT'
  | 'OPENING_BALANCE';

export interface InventoryTransaction {
  id: string;
  timestamp: string;
  type: InventoryTransactionType;
  documentId: string;
  documentCode: string;
  sku: string;
  productId?: string;
  productName: string;
  warehouseId: string;
  branchId?: string;
  quantityIn: number;
  quantityOut: number;
  unitCost: number;
  totalCost: number;
  layerId?: string;
  actor: string;
  status: 'posted' | 'voided';
  note?: string;
}

export interface StockBalance {
  key: string;
  sku: string;
  productId?: string;
  productName: string;
  warehouseId: string;
  branchId?: string;
  openingQuantity: number;
  quantityIn: number;
  quantityOut: number;
  onHand: number;
  reserved: number;
  available: number;
  fifoValue: number;
  nextFifoCost: number;
  lastMovementAt?: string;
}

export interface InventoryReconciliationRow {
  key: string;
  sku: string;
  warehouseId: string;
  ledgerQuantity: number;
  fifoQuantity: number;
  balanceQuantity: number;
  ledgerVsFifo: number;
  fifoVsBalance: number;
  healthy: boolean;
}

const n = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const layerQty = (layer: InventoryLayer) => n(layer.quantityRemaining ?? layer.remainingQuantity);
const layerCost = (layer: InventoryLayer) => n(layer.purchasePrice ?? layer.costPrice);

export const inventoryEngine = {
  buildStockBalances(
    transactions: InventoryTransaction[],
    layers: InventoryLayer[],
    reservedByKey: Record<string, number> = {}
  ): StockBalance[] {
    const map = new Map<string, StockBalance>();
    const ensure = (sku: string, warehouseId: string, seed?: Partial<StockBalance>) => {
      const key = `${warehouseId}::${sku}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          sku,
          productId: seed?.productId,
          productName: seed?.productName || sku,
          warehouseId,
          branchId: seed?.branchId,
          openingQuantity: 0,
          quantityIn: 0,
          quantityOut: 0,
          onHand: 0,
          reserved: n(reservedByKey[key]),
          available: 0,
          fifoValue: 0,
          nextFifoCost: 0
        });
      }
      return map.get(key)!;
    };

    for (const tx of transactions.filter(t => t.status === 'posted')) {
      const row = ensure(tx.sku, tx.warehouseId, {
        productId: tx.productId,
        productName: tx.productName,
        branchId: tx.branchId
      });
      row.quantityIn += n(tx.quantityIn);
      row.quantityOut += n(tx.quantityOut);
      row.onHand += n(tx.quantityIn) - n(tx.quantityOut);
      if (tx.type === 'OPENING_BALANCE') row.openingQuantity += n(tx.quantityIn) - n(tx.quantityOut);
      if (!row.lastMovementAt || tx.timestamp > row.lastMovementAt) row.lastMovementAt = tx.timestamp;
    }

    for (const layer of layers) {
      const qty = layerQty(layer);
      if (qty <= 0 || !layer.warehouseId) continue;
      const row = ensure(layer.sku, layer.warehouseId, {
        productId: layer.productId,
        productName: layer.productName,
        branchId: layer.branchId
      });
      row.fifoValue += qty * layerCost(layer);
      const receivedAt = layer.receivedAt || layer.createdAt || '';
      if (row.nextFifoCost === 0 || receivedAt < (row.lastMovementAt || '9999')) {
        row.nextFifoCost = layerCost(layer);
      }
    }

    for (const row of map.values()) {
      if (row.onHand === 0 && row.fifoValue > 0) {
        row.onHand = layers
          .filter(l => l.sku === row.sku && l.warehouseId === row.warehouseId)
          .reduce((sum, l) => sum + Math.max(0, layerQty(l)), 0);
      }
      row.available = row.onHand - row.reserved;
    }

    return [...map.values()].sort((a, b) => a.sku.localeCompare(b.sku) || a.warehouseId.localeCompare(b.warehouseId));
  },

  normalizeLegacyTransactions(transactions: StockTransaction[]): InventoryTransaction[] {
    return transactions.map((tx, index) => {
      const type: InventoryTransactionType =
        tx.type === 'Nhập kho' ? 'PURCHASE_RECEIPT' :
        tx.type === 'Xuất bán' ? 'SALES_ISSUE' :
        tx.type === 'Xuất chuyển kho' ? 'TRANSFER_OUT' :
        tx.type === 'Nhập chuyển kho' ? 'TRANSFER_IN' :
        tx.type === 'Điều chỉnh tăng' ? 'ADJUSTMENT_IN' :
        tx.type === 'Điều chỉnh giảm' ? 'ADJUSTMENT_OUT' :
        'ADJUSTMENT_OUT';

      return {
        id: tx.id || `LEGACY-TX-${index}`,
        timestamp: tx.date,
        type,
        documentId: tx.docCode,
        documentCode: tx.docCode,
        sku: tx.sku,
        productId: tx.productId,
        productName: tx.productName,
        warehouseId: tx.warehouseId || 'unknown',
        branchId: tx.branchId,
        quantityIn: n(tx.qtyIn),
        quantityOut: n(tx.qtyOut),
        unitCost: n(tx.unitCost),
        totalCost: n(tx.totalValue),
        layerId: tx.lotId,
        actor: tx.actor,
        status: 'posted',
        note: tx.note
      };
    });
  },

  reconcile(
    transactions: InventoryTransaction[],
    layers: InventoryLayer[],
    balances?: StockBalance[]
  ): InventoryReconciliationRow[] {
    const ledger = new Map<string, number>();
    const fifo = new Map<string, number>();
    for (const tx of transactions.filter(t => t.status === 'posted')) {
      const key = `${tx.warehouseId}::${tx.sku}`;
      ledger.set(key, (ledger.get(key) || 0) + n(tx.quantityIn) - n(tx.quantityOut));
    }
    for (const layer of layers) {
      if (!layer.warehouseId) continue;
      const key = `${layer.warehouseId}::${layer.sku}`;
      fifo.set(key, (fifo.get(key) || 0) + Math.max(0, layerQty(layer)));
    }

    const keys = new Set([...ledger.keys(), ...fifo.keys(), ...(balances || []).map(b => b.key)]);
    return [...keys].map(key => {
      const separator = key.indexOf('::');
      const warehouseId = separator >= 0 ? key.slice(0, separator) : key;
      const sku = separator >= 0 ? key.slice(separator + 2) : '';
      const ledgerQuantity = ledger.get(key) || 0;
      const fifoQuantity = fifo.get(key) || 0;
      const balanceQuantity = balances?.find(b => b.key === key)?.onHand ?? fifoQuantity;
      const ledgerVsFifo = ledgerQuantity - fifoQuantity;
      const fifoVsBalance = fifoQuantity - balanceQuantity;
      return {
        key,
        sku,
        warehouseId,
        ledgerQuantity,
        fifoQuantity,
        balanceQuantity,
        ledgerVsFifo,
        fifoVsBalance,
        healthy: Math.abs(ledgerVsFifo) < 0.000001 && Math.abs(fifoVsBalance) < 0.000001
      };
    });
  },

  getIntegritySummary(rows: InventoryReconciliationRow[]) {
    const discrepancies = rows.filter(row => !row.healthy);
    return {
      healthy: discrepancies.length === 0,
      totalRows: rows.length,
      discrepancyCount: discrepancies.length,
      discrepancies
    };
  },

  getSignedQuantity(transaction: InventoryTransaction) {
    return n(transaction.quantityIn) - n(transaction.quantityOut);
  }
};
