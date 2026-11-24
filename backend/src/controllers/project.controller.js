const prisma = require("../db/prisma");

/**
 * Create a new video project (Creator)
 */
const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      video_type,
      funding_target,
      allowed_expenses
    } = req.body;

    if (!title || !funding_target) {
      return res.status(400).json({
        success: false,
        message: "Title and funding target are required"
      });
    }

    const fundingTargetNum = Number(funding_target);
    if (isNaN(fundingTargetNum) || fundingTargetNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Funding target must be a positive number"
      });
    }

    // Ensure creator profile exists
    const creatorProfile = await prisma.creatorProfile.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });

    // Create project, expense items, and initial milestone in transaction
    const project = await prisma.$transaction(async (tx) => {
      const newProj = await tx.project.create({
        data: {
          creatorProfileId: creatorProfile.id,
          title,
          description: description || "",
          videoType: video_type || "general",
          fundingTarget: fundingTargetNum,
          amountRaised: 0,
          status: "FUNDING"
        }
      });

      // Insert expense categories if provided
      if (Array.isArray(allowed_expenses) && allowed_expenses.length > 0) {
        await tx.expenseItem.createMany({
          data: allowed_expenses.map((category) => ({
            projectId: newProj.id,
            category
          }))
        });
      }

      // Automatically initialize default primary milestone
      await tx.milestone.create({
        data: {
          projectId: newProj.id,
          title: "Complete Video Production & Delivery",
          description: "Full production, editing, and final video demo delivery.",
          targetAmount: fundingTargetNum,
          sequenceOrder: 1,
          status: "PENDING"
        }
      });

      return await tx.project.findUnique({
        where: { id: newProj.id },
        include: {
          expenses: true,
          milestones: true,
          creatorProfile: {
            include: { user: { select: { id: true, name: true, email: true } } }
          }
        }
      });
    });

    // Respond in format compatible with frontend state expectations
    res.status(201).json({
      id: project.id,
      title: project.title,
      description: project.description,
      video_type: project.videoType,
      funding_target: project.fundingTarget,
      amount_raised: project.amountRaised,
      status: project.status,
      allowed_expenses: project.expenses.map((e) => e.category),
      milestones: project.milestones,
      creator: {
        id: project.creatorProfile.id,
        name: project.creatorProfile.user.name
      },
      created_at: project.createdAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all projects
 */
const getProjects = async (req, res, next) => {
  try {
    let whereClause = {};

    // Filter by own projects if requested by creator
    if (req.query.mine === "true" && req.user) {
      const profile = await prisma.creatorProfile.findUnique({
        where: { userId: req.user.id }
      });
      if (profile) {
        whereClause.creatorProfileId = profile.id;
      }
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        creatorProfile: {
          include: { user: { select: { id: true, name: true } } }
        },
        expenses: true,
        milestones: true,
        investments: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Return frontend-friendly structures
    const formatted = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      video_type: p.videoType,
      funding_target: p.fundingTarget,
      amount_raised: p.amountRaised,
      status: p.status,
      allowed_expenses: p.expenses.map((e) => e.category),
      creator: {
        id: p.creatorProfile.id,
        name: p.creatorProfile.user.name,
        niches: p.creatorProfile.niches
      },
      investors_count: p.investments.length,
      milestones: p.milestones,
      created_at: p.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creatorProfile: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        expenses: true,
        milestones: {
          include: { submissions: true },
          orderBy: { sequenceOrder: "asc" }
        },
        investments: {
          include: {
            investor: { select: { id: true, name: true } }
          }
        },
        escrowTransactions: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      id: project.id,
      title: project.title,
      description: project.description,
      video_type: project.videoType,
      funding_target: project.fundingTarget,
      amount_raised: project.amountRaised,
      status: project.status,
      allowed_expenses: project.expenses.map((e) => e.category),
      creator: {
        id: project.creatorProfile.id,
        name: project.creatorProfile.user.name,
        niches: project.creatorProfile.niches,
        portfolioUrl: project.creatorProfile.portfolioUrl
      },
      investments: project.investments.map((inv) => ({
        id: inv.id,
        amount: inv.amount,
        investorName: inv.investor.name,
        status: inv.status,
        date: inv.createdAt
      })),
      milestones: project.milestones,
      escrowTransactions: project.escrowTransactions,
      created_at: project.createdAt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById
};
