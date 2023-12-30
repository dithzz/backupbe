// models/apiCall.js
const mongoose = require('mongoose');

const apiCallSchema = new mongoose.Schema(
  {
    reqType: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'], required: true },
    endpoint: { type: String, required: true },
    params: { type: Object, default: {} },
    body: { type: Object, default: {} },
    headers: { type: Object, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assuming you have a User model
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
    auth: {
      type: {
        type: String,
        enum: ['None', 'Bearer Token', 'Basic Auth'],
        default: 'None',
      },
      value: String,
    },
  },

  { timestamps: true }
);

const ApiCall = mongoose.model('ApiCall', apiCallSchema);
module.exports = ApiCall;
