const express = require('express');

const { getCheckoutSession } = require('../controllers/bookingControllers');
const { protect, allowOnlyTo } = require('../controllers/authControllers');

const bookingRouter = express.Router();

bookingRouter.get(
    '/checkout-session/:tourId',
    protect,
    allowOnlyTo('user'),
    getCheckoutSession
);

module.exports = bookingRouter;
