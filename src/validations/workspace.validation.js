const Joi = require('joi');
const { password } = require('./custom.validation');

const createWorkspace = {
  body: Joi.object().keys({
    name: Joi.string().min(1).required(),
    summary: Joi.string().min(1).optional(),
    privacy: Joi.string().valid('Personal', 'Private', 'Team', 'Public', 'Private Team').default('Private').required(),
    members: Joi.array().items(
      Joi.object({
        user: Joi.string().hex().required(),
        isAdmin: Joi.boolean().default(false),
      })
    ),
  }),
};

module.exports = {
  createWorkspace,
};
