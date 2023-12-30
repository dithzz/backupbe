const mongoose = require('mongoose');

const workspacePermissionSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    permissions: {
      collections: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Set default values for permissions if the user is an admin
workspacePermissionSchema.pre('save', function (next) {
  if (this.user.isAdmin) {
    this.permissions.collections.view = true;
    this.permissions.collections.create = true;
    this.permissions.collections.update = true;
    this.permissions.collections.delete = true;
    // Set other permissions to true if needed
  }
  next();
});

const WorkspacePermission = mongoose.model('WorkspacePermission', workspacePermissionSchema);

module.exports = WorkspacePermission;
