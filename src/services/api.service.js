const { Api } = require('../models');

const createDynamicAPI = async (apiName, schema, userId, workspaceId) => {
  const api = new Api({ apiName, schema, createdBy: userId, workspace: workspaceId });
  await api.save();
  return api;
};

const getDynamicAPI = async (apiName) => {
  return Api.findOne({ apiName });
};

const getDynamicAPIsByWorkspace = async (workspaceId) => {
  return Api.find({ workspace: workspaceId });
};

module.exports = {
  createDynamicAPI,
  getDynamicAPI,
  getDynamicAPIsByWorkspace,
};
