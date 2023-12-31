// services/WorkspaceService.js

const { Workspace, User, WorkspacePermission } = require('../models');

const createWorkspace = async (name, purpose, userId, privacy) => {
  try {
    // Check if the user exists
    const user = await User.findOne({ _id: userId });

    if (user) {
      // User exists, create the workspace
      const newWorkspace = await Workspace.create({
        name,
        purpose,
        createdBy: userId,
        members: [{ user: userId, isAdmin: true }],
        privacy,
      });

      return newWorkspace;
    } else {
      // User does not exist
      throw new Error('User not found');
    }
  } catch (error) {
    throw error;
  }
};

const updateWorkspace = async (workspaceId, name, purpose, userId) => {
  // Check if the workspace with the given ID exists and belongs to the user
  const existingWorkspace = await Workspace.findOne({ _id: workspaceId });

  if (!existingWorkspace) {
    return null; // Workspace not found or doesn't belong to the user
  }

  // Update the workspace with the new name and purpose
  existingWorkspace.name = name;
  existingWorkspace.purpose = purpose;

  // Save the updated workspace
  const updatedWorkspace = await existingWorkspace.save();

  return updatedWorkspace;
};

const getUserWorkspaces = async (userId) => {
  try {
    // Retrieve workspaces where the user is a member
    const userWorkspaces = await Workspace.find({ 'members.user': userId });

    return userWorkspaces;
  } catch (error) {
    throw error;
  }
};

const getWorkspace = async (workspaceId, userId) => {
  try {
    // Retrieve the workspace where the user is a member
    const workspace = await Workspace.findOne({ _id: workspaceId, 'members.user': userId });

    return workspace;
  } catch (error) {
    throw error;
  }
};

const sendInvitation = async (senderId, workspaceId, invitedUserId) => {
  try {
    // Check if the sender is the workspace owner
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      createdBy: senderId,
    });

    if (!workspace) {
      return { success: false, statusCode: 404, message: 'Workspace not found.' };
    }

    // Check if the invited user exists
    const invitedUser = await User.findById(invitedUserId);

    if (!invitedUser) {
      return { success: false, statusCode: 404, message: 'Invited user not found.' };
    }

    // Check if the user is already a member or has an existing invitation
    const isMember = workspace.members.some((member) => member.user.equals(invitedUser._id));
    const hasInvitation = workspace.invitations.some((invitation) => invitation.invitedUser.equals(invitedUser._id));

    if (isMember || hasInvitation) {
      return { success: false, statusCode: 400, message: 'User is already a member or has an invitation.' };
    }

    // Add the invitation to the workspace
    workspace.invitations.push({ invitedUser: invitedUser._id, status: 'Pending' });
    await workspace.save();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, statusCode: 500, message: 'Internal server error.' };
  }
};

const getInvitedWorkspaces = async (userId) => {
  try {
    // Find workspaces where the user is invited
    const invitedWorkspaces = await Workspace.find({
      'invitations.invitedUser': userId,
      'invitations.status': 'Pending',
    });

    // Return the result
    return invitedWorkspaces;
  } catch (error) {
    // Handle errors, log them, and optionally throw or return an error response
    console.error(error);
    throw error;
  }
};

const updatePermissions = async (workspaceId, userId, newPermissions) => {
  // Update permissions in the database
  try {
    const updatedPermissions = await WorkspacePermission.findOneAndUpdate(
      { workspace: workspaceId, user: userId },
      { permissions: newPermissions },
      { new: true }
    );

    return updatedPermissions;
  } catch (error) {
    // Handle errors, log them, and optionally throw or return an error response
    console.error(error);
    throw error;
  }
};

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
  sendInvitation,
  getInvitedWorkspaces,
  updatePermissions,
};
