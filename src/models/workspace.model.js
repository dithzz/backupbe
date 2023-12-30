const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isAdmin: { type: Boolean, default: false },
      },
    ],
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    privacy: {
      type: String,
      enum: ['Personal', 'Private', 'Team', 'Public', 'Private Team'],
      default: 'Private',
    },
    invitations: [
      {
        invitedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['Pending', 'Accepted', 'Declined'],
          default: 'Pending',
        },
        // Add other fields as needed
        // ...
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
