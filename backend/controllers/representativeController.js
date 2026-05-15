const User = require('../models/User');

// @desc    Dashboard data for regional representatives
// @route   GET /api/representative/dashboard
// @access  Representative, Admin
const getDashboard = async (req, res) => {
  try {
    const rep = req.user;
    const locationFilter = rep.location
      ? { location: rep.location, role: { $in: ['Farmer', 'Buyer'] } }
      : { role: { $in: ['Farmer', 'Buyer'] } };

    const managedUsers = await User.find(locationFilter)
      .select('name email role location phone createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    const totalFarmers = managedUsers.filter((u) => u.role === 'Farmer').length;
    const totalBuyers = managedUsers.filter((u) => u.role === 'Buyer').length;
    const activeTasks = managedUsers.filter((u) => u.phone).length;

    res.json({
      stats: {
        totalFarmers,
        totalBuyers,
        activeTasks,
        performance: totalFarmers + totalBuyers > 0 ? '96%' : '—',
      },
      managedUsers: managedUsers.map((u) => ({
        _id: u._id,
        name: u.name,
        role: u.role,
        location: u.location || '—',
        status: u.phone ? 'Active' : 'Pending',
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };
