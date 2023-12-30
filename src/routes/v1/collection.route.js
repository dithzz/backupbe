// routes/collectionRoutes.js
const express = require('express');
const { CollectionController } = require('../../controllers');
const { authenticateUser } = require('../../services/auth.service');
// const apiCallRoute = require('./api.route');

const router = express.Router();

router.post('/', authenticateUser, CollectionController.createCollection);
router.get('/workspace-collections/:workspaceId', CollectionController.getCollectionsByWorkspace);
router.get('/:collectionId', authenticateUser, CollectionController.getCollection);
router.put('/:collectionId/update', authenticateUser, CollectionController.updateCollection);
router.delete('/:collectionId/delete', authenticateUser, CollectionController.deleteCollection);

module.exports = router;
