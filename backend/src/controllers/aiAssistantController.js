const { validationResult } = require("express-validator");
const aiAssistantService = require("../services/aiAssistantService");

async function chat(req, res, next) {
  try {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid request.",
        errors: validation.array(),
      });
    }

    // userId is derived from JWT middleware only; never accept it from the client.
    const result = await aiAssistantService.askFinancialAssistant(
      req.user.userId,
      req.body.question.trim(),
      req.body.conversation,
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { chat };
