const Solution = require('../models/Solution');
const Problem = require('../models/Problem');
const mongoose = require('mongoose');
const { parsePagination, setPaginationHeaders } = require('../utils/pagination');

// @desc    Get solutions for a problem
// @route   GET /api/problems/:problemId/solutions
// @access  Public
const getSolutionsByProblem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.problemId)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { problem: req.params.problemId };
    const [solutions, total] = await Promise.all([
      Solution.find(filter).populate('student', 'name university').sort('-createdAt').skip(skip).limit(limit),
      Solution.countDocuments(filter),
    ]);
    setPaginationHeaders(res, { page, limit }, total);
    res.json(solutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a solution
// @route   POST /api/solutions
// @access  Private (Student)
const createSolution = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can post solutions' });
    }

    const { problemId, description, projectProposalUrl } = req.body;
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ message: 'A valid problem ID is required' });
    }
    if (typeof description !== 'string' || description.trim().length < 10 || description.length > 10000) {
      return res.status(400).json({ message: 'Solution description must be between 10 and 10000 characters' });
    }
    if (projectProposalUrl) {
      try {
        const proposalUrl = new URL(projectProposalUrl);
        if (!['http:', 'https:'].includes(proposalUrl.protocol)) throw new Error('Unsupported protocol');
      } catch {
        return res.status(400).json({ message: 'Project proposal URL must be a valid HTTP or HTTPS URL' });
      }
    }
    const problemExists = await Problem.exists({ _id: problemId });
    if (!problemExists) return res.status(404).json({ message: 'Problem not found' });

    const solution = new Solution({
      student: req.user._id,
      problem: problemId,
      description: description.trim(),
      projectProposalUrl
    });

    const createdSolution = await solution.save();
    res.status(201).json(createdSolution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSolutionsByProblem,
  createSolution,
};
