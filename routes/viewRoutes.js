const express = require('express');
const {
    getOverview,
    getTourDetails,
    getLoginForm,
    getAccount,
    getMyTours,
    alerts,
} = require('../controllers/viewControllers');
const { isLoggedIn, protect } = require('../controllers/authControllers');

const viewRouter = express.Router();

viewRouter.use(alerts);

viewRouter.get('/me', protect, getAccount);
viewRouter.get('/my-tours', protect, getMyTours);

viewRouter.use(isLoggedIn);

viewRouter.get('/', getOverview);
viewRouter.get('/tour/:tourSlug', getTourDetails);
viewRouter.get('/login', getLoginForm);

module.exports = viewRouter;
