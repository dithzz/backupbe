const { ApiCall, Collection } = require('../models');

const apiCallService = {};

apiCallService.getAllApiCalls = async (collectionId) => {
  return ApiCall.find();
};

apiCallService.createApiCall = async (data, userId) => {
  console.log(data, '{ collectionId, data }');
  try {
    const collection = await Collection.findById(data.collectionId);

    if (!collection) {
      throw new Error('Collection not found');
    }

    const apiCall = await ApiCall.create({ ...data, createdBy: userId });
    collection.apiCalls.push(apiCall);
    await collection.save();

    return apiCall;
  } catch (error) {
    throw error;
  }
};

apiCallService.getApiCallById = async (id) => {
  return ApiCall.findById(id);
};

apiCallService.updateApiCall = async (id, data) => {
  try {
    const apiCall = await ApiCall.findByIdAndUpdate(id, data, { new: true });
    if (!apiCall) {
      throw new Error('ApiCall not found');
    }
    return apiCall;
  } catch (error) {
    throw error;
  }
};

apiCallService.deleteApiCall = async (id) => {
  try {
    const apiCall = await ApiCall.findByIdAndDelete(id);
    if (!apiCall) {
      throw new Error('ApiCall not found');
    }
    return apiCall;
  } catch (error) {
    throw error;
  }
};

module.exports = apiCallService;
