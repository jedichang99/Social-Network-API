const router = require("express").Router();
const { User } = require("../models/user");

// GET all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().populate("thoughts friends");
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single user by _id with populated thought and friend data
router.get("/users/:id", async (req, res) => {
  try { dById(req.params.id).populate(
      "thoughts friends"
    );
    res.json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

// POST a new user
router.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT to update a user by _id
router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a user by _id
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    // Remove the user's _id from friends lists of other users
    await User.updateMany(
      { _id: { $in: user.friends } },
      { $pull: { friends: user._id } }
    );
    // Remove user's thoughts and associated reactions
    await Thought.deleteMany({ username: user.username });
    res.json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
