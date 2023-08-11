const mongoose = require("mongoose");
const express = require("express");
const thought_routes = require("./routes/thought-routes");
const user_routes = require("./routes/user-routes");

const app = express();

const reactionSchema = new mongoose.Schema({
  reactionId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  reactionBody: {
    type: String,
    required: true,
    maxlength: 280,
  },
  username: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => new Date(timestamp).toISOString(),
  },
});

const thoughtSchema = new mongoose.Schema({
  thoughtText: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 280,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => new Date(timestamp).toISOString(),
  },
  username: {
    type: String,
    required: true,
  },
  reactions: [reactionSchema],
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    thoughts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thought",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    id: false,
  }
);

userSchema.virtual("friendCount").get(function () {
  return this.friends.length;
});

thoughtSchema.virtual("reactionCount").get(function () {
  return this.reactions.length;
});

const User = mongoose.model("User", userSchema);
const Thought = mongoose.model("Thought", thoughtSchema);

module.exports = { User, Thought };

app.use(express.json());
