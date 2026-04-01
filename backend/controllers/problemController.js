const Problem = require('../models/Problem');

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().populate('farmer', 'name location');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a problem
// @route   POST /api/problems
// @access  Private (Farmer)
const createProblem = async (req, res) => {
  try {
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ message: 'Only farmers can post problems' });
    }

    const { title, description, category, image } = req.body;

    const problem = new Problem({
      farmer: req.user._id,
      title,
      description,
      category,
      image
    });

    const createdProblem = await problem.save();
    res.status(201).json(createdProblem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProblems,
  createProblem,
};
