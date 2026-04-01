const express = require('express');
const router = express.Router();
const { getSolutionsByProblem, createSolution } = require('../controllers/solutionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createSolution);

router.get('/problem/:problemId', getSolutionsByProblem);

module.exports = router;
