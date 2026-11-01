const service = require("../services/payoutService");
const { validationResult } = require("express-validator");
function check(req, res) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ success: false, errors: result.array() });
    return false;
  }
  return true;
}
const getPayoutOptions = (req, res) =>
  res.json({
    success: true,
    data: {
      currency: "VES",
      methods: [
        { id: "UPI", label: "UPI", requiredFields: ["upiId"] },
        {
          id: "BANK_TRANSFER",
          label: "Bank Transfer",
          requiredFields: ["accountHolderName", "accountNumber", "ifscCode"],
        },
      ],
    },
  });
const createPayoutRequest = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.createPayoutRequest(req.user.userId, req.body);
    res.status(data.duplicate ? 200 : 201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
const getMyPayouts = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.getMyPayouts(
      req.user.userId,
      req.query.page,
      req.query.limit,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
const getMyPayoutById = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.getMyPayoutById(req.user.userId, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
const processPayout = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.processPayout(req.params.id, req.user.userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
const approvePayout = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.approvePayout(req.params.id, req.user.userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
const rejectPayout = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.rejectPayout(
      req.params.id,
      req.user.userId,
      req.body.reason,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getPayoutOptions,
  createPayoutRequest,
  getMyPayouts,
  getMyPayoutById,
  processPayout,
  approvePayout,
  rejectPayout,
};
