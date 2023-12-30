// routes/apiRoutes.js
const express = require('express');
const { ApiController } = require('../../controllers');
const { authenticateUser } = require('../../services/auth.service');

const router = express.Router();

router.post('/create-api', authenticateUser, ApiController.createDynamicAPI);
router.get('/:apiName', authenticateUser, ApiController.getDynamicAPI);
router.get('/:apiName/detail', authenticateUser, ApiController.getDynamicAPIDetail);
router.get('/workspace/:workspaceId', authenticateUser, ApiController.getAllDynamicAPIsUnderWorkspace);

module.exports = router;
