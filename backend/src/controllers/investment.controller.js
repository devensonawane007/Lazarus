const prisma = require("../db/prisma");
const EscrowService = require("../services/escrow.service");

/**
 * Investor contributes funds to a project (held in escrow)
 */
const contribute = async (req, res, next) => {
  try {
    const investorId = req.user.id;
    const { project_id, amount } = req.body;

    if (!project_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "project_id and amount are required"
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }

    const result = await EscrowService.recordInvestment({
      investorId,
      projectId: project_id,
      amount: numAmount
    });

    res.json({
      success: true,
      message: `Investment of ₹${numAmount} placed in escrow hold!`,
      totalRaised: result.totalRaised,
      projectStatus: result.projectStatus,
      investment: result.investment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get real investor dashboard investments and stats
 */
const getInvestorDashboard = async (req, res, next) => {
  try {
    const investorId = req.user.id;

    const investments = await prisma.investment.findMany({
      where: { investorId },
      include: {
        project: {
          include: {
            creatorProfile: {
              include: { user: { select: { name: true } } }
            },
            milestones: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    const formatted = investments.map((inv) => ({
      id: inv.id,
      projectId: inv.projectId,
      projectName: inv.project.title,
      creatorName: inv.project.creatorProfile.user.name,
      amount: inv.amount,
      status: inv.status,
      date: inv.createdAt.toISOString().split("T")[0],
      projectStatus: inv.project.status,
      milestonesCount: inv.project.milestones.length
    }));

    res.json({
      success: true,
      totalInvested,
      investments: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Proportional Revenue Share Simulator
 */
const simulateRevenue = async (req, res, next) => {
  try {
    const { project_id, revenue_amount } = req.body;

    if (!project_id || !revenue_amount) {
      return res.status(400).json({
        success: false,
        message: "project_id and revenue_amount are required"
      });
    }

    const revenue = Number(revenue_amount);
    if (isNaN(revenue) || revenue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Revenue amount must be a positive number"
      });
    }

    const investments = await prisma.investment.findMany({
      where: { projectId: project_id },
      include: {
        investor: { select: { id: true, name: true, email: true } }
      }
    });

    if (investments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No contributors found for this project"
      });
    }

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    const payouts = investments.map((inv, index) => {
      const share = inv.amount / totalInvested;
      return {
        investor: inv.investor.name || `Investor ${index + 1}`,
        invested: inv.amount,
        percentage: `${(share * 100).toFixed(1)}%`,
        payout: Math.round(share * revenue)
      };
    });

    res.json({
      success: true,
      totalInvested,
      simulatedRevenue: revenue,
      payouts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  contribute,
  getInvestorDashboard,
  simulateRevenue
};
