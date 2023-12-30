const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema(
  {
    apiName: {
      type: String,
      required: true,
      unique: false,
    },
    schema: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming your user model is named 'User'
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace', // Assuming your workspace model is named 'Workspace'
      required: true,
    },
  },
  {
    timestamps: true, // This line adds createdAt and updatedAt fields
  }
);

const ApiModel = mongoose.model('Api', apiSchema);

module.exports = ApiModel;
