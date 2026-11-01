const { body } = require("express-validator");
const validateAdminWalletOperation = [
  body("targetUserId").isMongoId(),
  body("idempotencyKey").isString().trim().isLength({ min: 8, max: 120 }),
  body("reason").optional().isString().trim().isLength({ max: 250 }),
];
module.exports = { validateAdminWalletOperation };
