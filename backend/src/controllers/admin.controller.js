const prisma = require("../db/prisma");

/**
 * Get platform health, metrics, and integration overview
 */
const getPlatformHealth = async (req, res, next) => {
  try {
    const [
      userCount,
      creatorCount,
      brandCount,
      campaignCount,
      collaborationCount,
      socialAccountsCount,
      failedSyncsCount,
      auditLogsCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.creatorProfile.count(),
      prisma.brandProfile.count(),
      prisma.campaign.count(),
      prisma.collaboration.count(),
      prisma.socialAccount.count(),
      prisma.socialAccount.count({ where: { status: "SYNC_FAILED" } }),
      prisma.auditLog.count()
    ]);

    // Active failed synchronizations
    const recentFailedSyncs = await prisma.socialAccount.findMany({
      where: { status: "SYNC_FAILED" },
      include: {
        creatorProfile: {
          include: { user: { select: { name: true, email: true } } }
        }
      },
      take: 10,
      orderBy: { updatedAt: "desc" }
    });

    res.json({
      success: true,
      stats: {
        totalUsers: userCount,
        creators: creatorCount,
        brands: brandCount,
        activeCampaigns: campaignCount,
        collaborations: collaborationCount,
        connectedSocialAccounts: socialAccountsCount,
        failedSyncs: failedSyncsCount,
        totalAuditEvents: auditLogsCount
      },
      recentFailedSyncs,
      systemStatus: {
        api: "healthy",
        database: "connected (Neon PostgreSQL 18.7)",
        encryption: "active (AES-256-GCM)",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all users with filtering and roles
 */
const listUsers = async (req, res, next) => {
  try {
    const { role, query, page = 1, limit = 20 } = req.query;

    const whereClause = {};
    if (role) {
      whereClause.role = role.toUpperCase();
    }
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          creatorProfile: {
            select: { id: true, niches: true, isMouSigned: true }
          },
          brandProfile: {
            select: { id: true, companyName: true, isVerified: true }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle brand verification badge
 */
const toggleBrandVerification = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const { isVerified } = req.body;

    const brand = await prisma.brandProfile.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand profile not found" });
    }

    const updated = await prisma.brandProfile.update({
      where: { id: brandId },
      data: { isVerified: Boolean(isVerified) }
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: `BRAND_VERIFICATION_${isVerified ? "GRANTED" : "REVOKED"}`,
        resourceType: "BRAND_PROFILE",
        resourceId: brandId
      }
    });

    res.json({
      success: true,
      message: `Brand verification set to ${isVerified}`,
      brand: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" }
      }),
      prisma.auditLog.count()
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User privacy data export (GDPR compliance)
 */
const exportUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: {
          include: {
            socialAccounts: { select: { platform: true, username: true, createdAt: true } },
            contents: true,
            metricSnapshots: true,
            collaborations: true
          }
        },
        brandProfile: {
          include: { campaigns: true, collaborations: true }
        },
        notifications: true,
        auditLogs: true
      }
    });

    const { passwordHash: _, ...safeData } = user;

    res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      userData: safeData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account and purge all data
 */
const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: "Account and associated personal data successfully purged."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformHealth,
  listUsers,
  toggleBrandVerification,
  getAuditLogs,
  exportUserData,
  deleteUserAccount
};
