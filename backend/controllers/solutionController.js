const Solution = require('../models/Solution');

// @desc    Get solutions for a problem
// @route   GET /api/problems/:problemId/solutions
// @access  Public
const getSolutionsByProblem = async (req, res) => {
  try {
    const solutions = await Solution.find({ problem: req.params.problemId }).populate('student', 'name university');
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

    const solution = new Solution({
      student: req.user._id,
      problem: problemId,
      description,
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
