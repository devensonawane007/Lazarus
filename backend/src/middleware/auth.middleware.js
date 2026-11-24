const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "lazarus_v2_super_secure_jwt_secret_key_change_in_production";

/**
 * Verify JWT token and attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing or invalid format"
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        creatorProfile: true,
        brandProfile: true,
        investorProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists"
      });
    }

    // Attach user to request (omit passwordHash)
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal authentication error"
    });
  }
};

/**
 * Role-Based Access Control middleware
 * @param  {...string} allowedRoles - E.g. 'CREATOR', 'BRAND', 'INVESTOR'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in"
      });
    }

    const userRole = req.user.role.toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(", ")}] roles`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET
};
