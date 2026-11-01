const WalletAuditLog = require("../models/WalletAuditLog");

async function recordWalletAudit(data, session) {
  const [record] = await WalletAuditLog.create(
    [data],
    session ? { session } : {},
  );
  return record;
}

module.exports = { recordWalletAudit };
