// routes/workspaceRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../services/auth.service');
const { WorkspaceController } = require('../../controllers');
const { workspaceValidation } = require('../../validations');
const validate = require('../../middlewares/validate');

// Create a new workspace
router.post('/', validate(workspaceValidation.createWorkspace), authenticateUser, WorkspaceController.createWorkspace);
router.get('/invitations', authenticateUser, WorkspaceController.getWorkspaceInvitations);

// Get all workspaces for a user
router.get('/', authenticateUser, WorkspaceController.getUserWorkspaces);

// Get all workspaces for a user
router.get('/:workspaceId', authenticateUser, WorkspaceController.getUserWorkspace);

router.put('/:workspaceId', authenticateUser, WorkspaceController.updateWorkspace); // Add this line for the new update route

router.post('/:workspaceId/invite/:userId', authenticateUser, WorkspaceController.sendWorkspaceInvitation);

router.get('/:workspaceId/permissions', authenticateUser, WorkspaceController.getWorkspacePermissions);
router.get('/:workspaceId/permissions/all', authenticateUser, WorkspaceController.getWorkspacePermissionsOfUsers);
router.get('/:workspaceId/permissions/:userId', authenticateUser, WorkspaceController.getUserWorkspacePermissions);

module.exports = router;
