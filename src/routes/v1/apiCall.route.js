const express = require('express');
const { ApiCallController } = require('../../controllers');
const catchAsync = require('../../utils/catchAsync');
const { authenticateUser } = require('../../services/auth.service');
const router = express.Router();

// Specify the collectionId in the route for all API calls within a collection
router
  .route('/')
  .get(authenticateUser, catchAsync(ApiCallController.getAllApiCalls))
  .post(authenticateUser, catchAsync(ApiCallController.createApiCall));

router
  .route('/:id')
  .get(authenticateUser, catchAsync(ApiCallController.getApiCallById))
  .put(authenticateUser, catchAsync(ApiCallController.updateApiCall))
  .delete(authenticateUser, catchAsync(ApiCallController.deleteApiCall));

module.exports = router;
