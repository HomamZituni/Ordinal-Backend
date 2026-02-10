const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password; // Will be hashed by pre-save hook

    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      aiEnabled: user.aiEnabled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle AI recommendations
// @route   PATCH /api/users/me/ai-toggle
// @access  Private
exports.toggleAI = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the aiEnabled field
    user.aiEnabled = !user.aiEnabled;
    await user.save();

    res.status(200).json({
      message: `AI recommendations ${user.aiEnabled ? 'enabled' : 'disabled'}`,
      aiEnabled: user.aiEnabled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
