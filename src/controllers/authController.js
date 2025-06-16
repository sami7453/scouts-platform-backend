const userService = require('../services/authService');

exports.register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const result = await userService.register({ email, password, role });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await userService.login({ email, password });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
