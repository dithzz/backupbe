// controllers/collectionController.js
const { WorkspacePermission } = require('../models');
const { collectionService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createCollection = catchAsync(async (req, res) => {
  const { name, workspaceId, apiCalls } = req.body;
  const userId = req.userId;

  // Check if the user has permission to create a collection in the workspace
  const hasPermission = await WorkspacePermission.exists({
    workspace: workspaceId,
    user: userId,
    'permissions.collections.create': true,
  });

  if (!hasPermission) {
    return res.status(403).json({ message: 'You do not have permission to create a collection in this workspace.' });
  }

  const { workspace, collection } = await collectionService.createCollection(workspaceId, {
    name,
    createdBy: userId,
    apiCalls,
    workspaceId,
  });

  res.status(201).json({ workspace, collection });
});

const getCollection = catchAsync(async (req, res) => {
  const { collectionId } = req.params;

  const collection = await collectionService.getCollectionById(collectionId);
  res.json(collection);
});

const getCollectionsByWorkspace = catchAsync(async (req, res) => {
  const { workspaceId } = req.params;

  const userId = req.userId;
  const hasPermission = await WorkspacePermission.exists({
    workspace: workspaceId,
    user: userId,
    'permissions.collections.view': true,
  });
  console.log(hasPermission, 'hasPermission');

  if (!hasPermission) {
    return res.status(403).json({ message: 'You do not have permission to view collections in this workspace.' });
  }
  const collection = await collectionService.getCollectionsByWorkspaceId(workspaceId);
  res.json(collection);
});

const updateCollection = catchAsync(async (req, res) => {
  const { collectionId } = req.params;
  const { workspaceId } = req.body;

  const userId = req.userId;
  const hasPermission = await WorkspacePermission.exists({
    workspace: workspaceId,
    user: userId,
    'permissions.collections.update': true,
  });

  if (!hasPermission) {
    return res.status(403).json({ message: 'You do not have permission to update collections in this workspace.' });
  }
  const updateData = req.body;
  const collection = await collectionService.updateCollection(collectionId, updateData);
  res.json(collection);
});

const deleteCollection = catchAsync(async (req, res) => {
  const { collectionId } = req.params;
  const { workspaceId } = req.body;
  const userId = req.userId;
  const hasPermission = await WorkspacePermission.exists({
    workspace: workspaceId,
    user: userId,
    'permissions.collections.delete': true,
  });

  if (!hasPermission) {
    return res.status(403).json({ message: 'You do not have permission to delete collections in this workspace.' });
  }
  const collection = await collectionService.deleteCollection(collectionId);
  res.json(collection);
});

module.exports = {
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  getCollectionsByWorkspace,
};
