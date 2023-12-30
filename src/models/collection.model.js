// models/collection.js
const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assuming you have a User model
    apiCalls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ApiCall' }],
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  },
  { timestamps: true }
);

const Collection = mongoose.model('Collection', collectionSchema);
module.exports = Collection;
