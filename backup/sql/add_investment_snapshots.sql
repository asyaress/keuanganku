CREATE TABLE IF NOT EXISTS investment_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assetId INT NOT NULL,
  monthKey VARCHAR(7) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_snapshot_asset FOREIGN KEY (assetId) REFERENCES investment_assets(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_snapshot_asset_month (assetId, monthKey),
  INDEX idx_snapshot_month (monthKey)
);

