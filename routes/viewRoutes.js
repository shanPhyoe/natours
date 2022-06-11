const express = require('express');
const {
    getOverview,
    getTourDetails,
    getLoginForm,
    getAccount,
    getMyTours,
} = require('../controllers/viewControllers');
const { isLoggedIn, protect } = require('../controllers/authControllers');
const { createCheckoutBooking } = require('../controllers/bookingControllers');

const viewRouter = express.Router();

viewRouter.get('/me', protect, getAccount);
viewRouter.get('/my-tours', protect, getMyTours);

viewRouter.use(isLoggedIn);

viewRouter.get('/', createCheckoutBooking, getOverview);
viewRouter.get('/tour/:tourSlug', getTourDetails);
viewRouter.get('/login', getLoginForm);

module.exports = viewRouter;
