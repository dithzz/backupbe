const { WorkspacePermission } = require('../models');

const createWorkspacePermissions = async (workspacePermissionData) => {
  // Create workspace permissions
  const workspacePermissions = new WorkspacePermission(workspacePermissionData);

  // Save the permissions to the database
  await workspacePermissions.save();

  return workspacePermissions;
};

module.exports = {
  createWorkspacePermissions,
  // Add other permission-related service functions as needed
};
