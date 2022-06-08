const express = require('express');

const { protect, allowOnlyTo } = require('../controllers/authControllers');
const {
    getAllReviews,
    getReview,
    setUserAndTourId,
    deleteReview,
    updateReview,
    createReview,
} = require('../controllers/reviewControllers');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protect);

reviewRouter
    .route('/')
    .get(getAllReviews)
    .post(protect, allowOnlyTo('user'), setUserAndTourId, createReview);

reviewRouter
    .route('/:id')
    .get(getReview)
    .patch(allowOnlyTo('admin', 'user'), updateReview)
    .delete(allowOnlyTo('admin', 'user'), deleteReview);

module.exports = reviewRouter;
