function toNumber(value: unknown) {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function toIso(value: unknown) {
  return value instanceof Date ? value.toISOString() : value;
}

export function serializeWallet(wallet: any) {
  return {
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    openingSaldo: toNumber(wallet.openingSaldo),
    createdAt: toIso(wallet.createdAt),
    updatedAt: toIso(wallet.updatedAt),
  };
}

export function serializeCategory(category: any) {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    createdAt: toIso(category.createdAt),
    updatedAt: toIso(category.updatedAt),
  };
}

export function serializeTransaction(tx: any) {
  return {
    id: tx.id,
    walletId: tx.walletId,
    categoryId: tx.categoryId ?? null,
    type: tx.type,
    amount: toNumber(tx.amount),
    note: tx.note ?? '',
    transactionDate: toIso(tx.transactionDate),
    assetId: tx.assetId ?? null,
    isVoided: Boolean(tx.isVoided),
    voidedAt: tx.voidedAt ? toIso(tx.voidedAt) : null,
    createdAt: toIso(tx.createdAt),
    updatedAt: toIso(tx.updatedAt),
    category: tx.category ? serializeCategory(tx.category) : null,
    wallet: tx.wallet ? serializeWallet(tx.wallet) : null,
    asset: tx.asset
      ? {
          id: tx.asset.id,
          assetType: tx.asset.assetType,
          subType: tx.asset.subType ?? '',
          assetName: tx.asset.assetName,
          isVoided: Boolean(tx.asset.isVoided),
        }
      : null,
  };
}

export function serializeAsset(asset: any) {
  return {
    id: asset.id,
    walletId: asset.walletId,
    assetType: asset.assetType,
    subType: asset.subType ?? '',
    assetName: asset.assetName,
    platform: asset.platform ?? '',
    quantity: asset.quantity != null ? toNumber(asset.quantity) : null,
    avgBuyPrice: asset.avgBuyPrice != null ? toNumber(asset.avgBuyPrice) : null,
    currentPrice: asset.currentPrice != null ? toNumber(asset.currentPrice) : null,
    totalInvested: toNumber(asset.totalInvested),
    totalValue: toNumber(asset.totalValue),
    isVoided: Boolean(asset.isVoided),
    voidedAt: asset.voidedAt ? toIso(asset.voidedAt) : null,
    createdAt: toIso(asset.createdAt),
    updatedAt: toIso(asset.updatedAt),
  };
}
