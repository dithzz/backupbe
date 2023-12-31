// controllers/WorkspaceController.js
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { WorkspaceService, WorkspacePermissionService } = require('../services');
const { WorkspacePermission } = require('../models');

const createWorkspace = catchAsync(async (req, res) => {
  const { name, summary, privacy, members } = req.body;
  const userId = req.userId;

  // Create the workspace
  const newWorkspace = await WorkspaceService.createWorkspace(name, summary, userId, privacy);

  // Send invitations to members
  for (const member of members) {
    await WorkspaceService.sendInvitation(userId, newWorkspace._id, member.user);
  }

  // Create default permissions for the user in the workspace
  const defaultWorkspacePermissions = {
    view: true,
    create: true,
    update: true,
    delete: true,
    // Add other permissions as needed
    // ...
  };

  const workspacePermissionData = {
    workspace: newWorkspace._id,
    user: userId,
    permissions: {
      collections: { ...defaultWorkspacePermissions },
      collabarators: { ...defaultWorkspacePermissions },
    },
  };

  // Create workspace permissions
  await WorkspacePermissionService.createWorkspacePermissions(workspacePermissionData);

  res.status(httpStatus.OK).send(newWorkspace);
});

const updateWorkspace = catchAsync(async (req, res) => {
  const { workspaceId } = req.params;
  const { name, purpose } = req.body;
  const userId = req.userId;

  const updatedWorkspace = await WorkspaceService.updateWorkspace(workspaceId, name, purpose, userId);

  if (!updatedWorkspace) {
    return res.status(httpStatus.NOT_FOUND).send({ msg: 'Workspace not found' });
  }

  res.status(httpStatus.OK).send(updatedWorkspace);
});

const getUserWorkspaces = catchAsync(async (req, res) => {
  const userId = req.userId;

  const userWorkspaces = await WorkspaceService.getUserWorkspaces(userId);

  res.status(httpStatus.OK).send(userWorkspaces);
});

const getUserWorkspace = catchAsync(async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.userId;

  const workspace = await WorkspaceService.getWorkspace(workspaceId, userId);

  if (!workspace) {
    return res.status(httpStatus.NOT_FOUND).send({ msg: 'Workspace not found or you are not a member' });
  }

  res.status(httpStatus.OK).send(workspace);
});

const sendWorkspaceInvitation = catchAsync(async (req, res) => {
  const { workspaceId, userId } = req.params;

  const result = await WorkspaceService.sendInvitation(req.user._id, workspaceId, userId);

  if (result.success) {
    res.status(200).json({ message: 'Invitation sent successfully.' });
  } else {
    res.status(result.OK).json({ message: result.message });
  }
});

const getWorkspacePermissions = catchAsync(async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.userId;

  // Query permissions based on the user and workspace
  const permissions = await WorkspacePermission.findOne({ workspace: workspaceId, user: userId });

  if (!permissions) {
    return res.status(404).json({ error: 'Permissions not found' });
  }

  res.status(200).json(permissions);
});

const getWorkspacePermissionsOfUsers = catchAsync(async (req, res) => {
  const { workspaceId } = req.params;

  // Query permissions based on the user and workspace
  const permissions = await WorkspacePermission.findOne({ workspace: workspaceId })
    .populate({
      path: 'workspace',
      populate: {
        path: 'members.user',
      },
    })
    .lean();
  if (!permissions) {
    return res.status(404).json({ error: 'Permissions not found' });
  }

  res.status(200).json(permissions);
});

const getUserWorkspacePermissions = catchAsync(async (req, res) => {
  const { workspaceId, userId } = req.params;

  // Query permissions based on the user and workspace
  const permissions = await WorkspacePermission.findOne({ workspace: workspaceId, user: userId }).populate('user').lean();

  if (!permissions) {
    return res.status(404).json({ error: 'Permissions not found' });
  }

  res.status(200).json(permissions);
});

const getWorkspaceInvitations = catchAsync(async (req, res) => {
  const userId = req.userId; // Assuming you have the userId available in the request

  // Call the service to get the invited workspaces
  const invitedWorkspaces = await WorkspaceService.getInvitedWorkspaces(userId);

  res.status(200).json({ invitedWorkspaces });
});

const updatePermissions = catchAsync(async (req, res) => {
  const { workspaceId, userId } = req.params;
  const { permissions } = req.body;

  // Ensure that the user making the request has the necessary permissions (e.g., admin check)
  // Implement your authentication and authorization logic here

  // Update permissions using the service
  const updatedPermissions = await WorkspaceService.updatePermissions(workspaceId, userId, permissions);

  res.status(200).json(updatedPermissions);
});

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getUserWorkspace,
  updateWorkspace,
  getWorkspacePermissions,
  sendWorkspaceInvitation,
  getWorkspaceInvitations,
  getWorkspacePermissionsOfUsers,
  getUserWorkspacePermissions,
  updatePermissions,
};
