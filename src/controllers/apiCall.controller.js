const { apiCallService } = require('../services');

const apiCallController = {};

apiCallController.getAllApiCalls = async (req, res) => {
  const { collectionId } = req.params;
  try {
    const apiCalls = await apiCallService.getAllApiCalls();
    res.json(apiCalls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

apiCallController.createApiCall = async (req, res) => {
  const { collectionId } = req.body;
  const userId = req.userId;
  try {
    const apiCall = await apiCallService.createApiCall(req.body, userId);
    res.status(201).json(apiCall);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

apiCallController.getApiCallById = async (req, res) => {
  const { id } = req.params;
  try {
    const apiCall = await apiCallService.getApiCallById(id);
    if (!apiCall) {
      res.status(404).json({ error: 'ApiCall not found' });
      return;
    }
    res.json(apiCall);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

apiCallController.updateApiCall = async (req, res) => {
  const { id } = req.params;
  try {
    const apiCall = await apiCallService.updateApiCall(id, req.body);
    if (!apiCall) {
      res.status(404).json({ error: 'ApiCall not found' });
      return;
    }
    res.json(apiCall);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

apiCallController.deleteApiCall = async (req, res) => {
  const { id } = req.params;
  try {
    const apiCall = await apiCallService.deleteApiCall(id);
    if (!apiCall) {
      res.status(404).json({ error: 'ApiCall not found' });
      return;
    }
    res.json(apiCall);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = apiCallController;
