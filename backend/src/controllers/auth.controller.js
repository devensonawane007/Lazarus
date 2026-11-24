const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const { JWT_SECRET } = require("../middleware/auth.middleware");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const normalizeRole = (role) => {
  if (!role) return "CREATOR";
  const upper = role.toUpperCase();
  if (["CREATOR", "BRAND", "INVESTOR", "ADMIN"].includes(upper)) {
    return upper;
  }
  return "CREATOR";
};

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, role, companyName, organization, niches } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = normalizeRole(role);

    // Create user with corresponding role profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          name: name.trim(),
          role: assignedRole
        }
      });

      if (assignedRole === "CREATOR") {
        await tx.creatorProfile.create({
          data: {
            userId: newUser.id,
            niches: Array.isArray(niches) ? niches : []
          }
        });
      } else if (assignedRole === "BRAND") {
        await tx.brandProfile.create({
          data: {
            userId: newUser.id,
            companyName: companyName || name.trim()
          }
        });
      } else if (assignedRole === "INVESTOR") {
        await tx.investorProfile.create({
          data: {
            userId: newUser.id,
            organization: organization || ""
          }
        });
      }

      return await tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          creatorProfile: true,
          brandProfile: true,
          investorProfile: true
        }
      });
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { passwordHash: _, ...safeUser } = user;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { name: email.trim() } // fallback support for name login
        ]
      },
      include: {
        creatorProfile: true,
        brandProfile: true,
        investorProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getMe
};
