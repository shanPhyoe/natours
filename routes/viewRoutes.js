const express = require('express');
const {
    getOverview,
    getTourDetails,
    getLoginForm,
    getAccount,
} = require('../controllers/viewControllers');
const { isLoggedIn, protect } = require('../controllers/authControllers');

const viewRouter = express.Router();

viewRouter.get('/me', protect, getAccount);

viewRouter.use(isLoggedIn);

viewRouter.get('/', getOverview);
viewRouter.get('/tour/:tourSlug', getTourDetails);
viewRouter.get('/login', getLoginForm);

module.exports = viewRouter;
