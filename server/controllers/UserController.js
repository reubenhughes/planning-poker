const User = require("../models/UserSchema");

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
    console.log(`Fetched user ${id}`);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createUser = async (req, res) => {
  const { name } = req.body;

  try {
    const user = await User.create({
      name,
    });
    res.status(200).json(user);
    console.log(`Created user ${res.params}`);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUser,
  createUser,
};
