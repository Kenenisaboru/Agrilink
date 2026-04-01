const express = require('express');
const router = express.Router();
const { getProblems, createProblem } = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProblems)
  .post(protect, createProblem);

module.exports = router;
