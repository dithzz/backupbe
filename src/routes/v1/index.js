const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const workspaceRoute = require('./workspace.route');
const collectionRoute = require('./collection.route');
const apiCallRoute = require('./apiCall.route');
const apiRoute = require('./api.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/workspace',
    route: workspaceRoute,
  },
  {
    path: '/api',
    route: apiRoute,
  },
  {
    path: '/collection',
    route: collectionRoute,
  },
  {
    path: '/apiCall',
    route: apiCallRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
