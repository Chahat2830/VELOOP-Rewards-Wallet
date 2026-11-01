const { body, query } = require("express-validator");
const currencies = ["VES", "SVES", "GEMS", "TOKENS", "SPINS"];
const creditTypes = [
  "REWARD",
  "BONUS",
  "REFERRAL",
  "DAILY_REWARD",
  "AD_REWARD",
  "GAME_REWARD",
  "ADMIN_CREDIT",
  "EXCHANGE_CREDIT",
];
const debitTypes = [
  "WITHDRAWAL",
  "EXCHANGE_DEBIT",
  "ADMIN_DEBIT",
  "CORRECTION",
];

const commonTransaction = [
  body("targetUserId").isMongoId(),
  body("currency").isIn(currencies),
  body("amount").isFloat({ gt: 0 }).toFloat(),
  body("source").isString().trim().notEmpty().isLength({ max: 80 }),
  body("idempotencyKey").isString().trim().isLength({ min: 8, max: 120 }),
  body("description").optional().isString().trim().isLength({ max: 250 }),
  body("referenceId")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 120 }),
  body("metadata").optional().isObject(),
];
const validateCredit = [...commonTransaction, body("type").isIn(creditTypes)];
const validateDebit = [...commonTransaction, body("type").isIn(debitTypes)];
const validateHistory = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("currency").optional().isIn(currencies),
];
module.exports = { validateCredit, validateDebit, validateHistory };
