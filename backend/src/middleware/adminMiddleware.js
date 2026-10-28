const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId).select("role isActive");

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User is inactive or unavailable",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAdmin };
