// services/collectionService.js

const { Collection, Workspace, ApiCall } = require('../models');

const createCollection = async (workspaceId, { name, createdBy, apiCalls }) => {
  try {
    // Step 1: Create the Collection document
    const collection = new Collection({ name, createdBy, workspace: workspaceId });

    // Save the collection
    await collection.save();

    // Create and associate API calls with the collection
    if (apiCalls && apiCalls.length > 0) {
      const apiCallObjects = await Promise.all(
        apiCalls.map(async (apiCallData) => {
          const apiCall = new ApiCall({ ...apiCallData, collection: collection._id });
          await apiCall.save();
          return apiCall;
        })
      );

      collection.apiCalls = apiCallObjects.map((apiCall) => apiCall._id);
      await collection.save();
    }

    // Step 2: Add the Collection document to the Workspace
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $push: { collections: collection._id } },
      { new: true }
    );

    return { workspace, collection };
  } catch (error) {
    throw error;
  }
};

const getCollectionsByWorkspaceId = async (workspaceId) => {
  try {
    const collection = await Collection.find({ workspace: workspaceId }).populate('apiCalls');
    return collection;
  } catch (error) {
    throw error;
  }
};

const getCollectionById = async (collectionId) => {
  try {
    const collection = await Collection.findById(collectionId).populate('apiCalls');
    return collection;
  } catch (error) {
    throw error;
  }
};

const updateCollection = async (collectionId, updateData) => {
  try {
    const collection = await Collection.findByIdAndUpdate(collectionId, updateData, { new: true });
    return collection;
  } catch (error) {
    throw error;
  }
};

const deleteCollection = async (collectionId) => {
  try {
    const collection = await Collection.findByIdAndDelete(collectionId);
    return collection;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCollection,
  getCollectionById,
  updateCollection,
  deleteCollection,
  getCollectionsByWorkspaceId,
};
