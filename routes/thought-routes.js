const router = require("express").Router();
const Thought = require("../models/thought");
const User = require("../models/user");
// User Routes

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
  try {
    const user = await User.findById(req.params.id).populate(
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

// Thought Routes

// GET all thoughts
router.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await Thought.find().populate("reactions");
    res.json(thoughts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single thought by _id
router.get("/thoughts/:id", async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id).populate("reactions");
    res.json(thought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// POST a new thought
router.post("/thoughts", async (req, res) => {
  try {
    const thought = await Thought.create(req.body);
    // Add the new thought's _id to the corresponding user's thoughts array
    await User.findByIdAndUpdate(thought.username, {
      $push: { thoughts: thought._id },
    });
    res.json(thought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT to update a thought by _id
router.put("/thoughts/:id", async (req, res) => {
  try {
    const thought = await Thought.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(thought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a thought by _id
router.delete("/thoughts/:id", async (req, res) => {
  try {
    const thought = await Thought.findByIdAndDelete(req.params.id);
    // Remove the thought's _id from the corresponding user's thoughts array
    await User.findByIdAndUpdate(thought.username, {
      $pull: { thoughts: thought._id },
    });
    res.json(thought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// POST a new reaction to a thought
router.post("/thoughts/:thoughtId/reactions", async (req, res) => {
  try {
    const reaction = {
      reactionBody: req.body.reactionBody,
      username: req.body.username,
    };
    const updatedThought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      { $push: { reactions: reaction } },
      { new: true }
    );
    res.json(updatedThought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a reaction from a thought by reactionId
router.delete(
  "/thoughts/:thoughtId/reactions/:reactionId",
  async (req, res) => {
    try {
      const updatedThought = await Thought.findByIdAndUpdate(
        req.params.thoughtId,
        { $pull: { reactions: { reactionId: req.params.reactionId } } },
        { new: true }
      );
      res.json(updatedThought);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

module.exports = router;
