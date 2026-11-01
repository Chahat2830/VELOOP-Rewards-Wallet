const { body, param, query } = require("express-validator");
const validateWithdrawal = [
  body("amount").isFloat({ gt: 0 }).toFloat(),
  body("payoutMethod").isIn(["UPI", "BANK_TRANSFER"]),
  body("idempotencyKey").isString().trim().isLength({ min: 8, max: 120 }),
  body("payoutDetails").isObject(),
  body("payoutDetails.upiId")
    .if(body("payoutMethod").equals("UPI"))
    .isString()
    .trim()
    .matches(/^[\w.-]{2,256}@[a-zA-Z0-9.-]{2,64}$/),
  body("payoutDetails.accountHolderName")
    .if(body("payoutMethod").equals("BANK_TRANSFER"))
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 }),
  body("payoutDetails.accountNumber")
    .if(body("payoutMethod").equals("BANK_TRANSFER"))
    .isString()
    .trim()
    .matches(/^[0-9]{6,30}$/),
  body("payoutDetails.ifscCode")
    .if(body("payoutMethod").equals("BANK_TRANSFER"))
    .isString()
    .trim()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i),
];
const validateId = [param("id").isMongoId()];
const validateReject = [
  param("id").isMongoId(),
  body("reason").isString().trim().notEmpty().isLength({ max: 250 }),
];
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];
module.exports = {
  validateWithdrawal,
  validateId,
  validateReject,
  validatePagination,
};
