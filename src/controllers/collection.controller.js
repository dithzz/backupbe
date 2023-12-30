// controllers/collectionController.js
const { collectionService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createCollection = catchAsync(async (req, res) => {
  const { name, workspaceId, apiCalls } = req.body;
  const userId = req.userId;

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
  const collection = await collectionService.getCollectionsByWorkspaceId(workspaceId);
  res.json(collection);
});

const updateCollection = catchAsync(async (req, res) => {
  const { collectionId } = req.params;
  const updateData = req.body;
  const collection = await collectionService.updateCollection(collectionId, updateData);
  res.json(collection);
});

const deleteCollection = catchAsync(async (req, res) => {
  const { collectionId } = req.params;
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
