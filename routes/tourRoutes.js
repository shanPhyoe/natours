const express = require('express');
const {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTour,
    getTourStats,
    getMonthlyPlan,
    getTourWithin,
    getTourDistance,
    uploadTourPhoto,
    resizeTourPhoto,
} = require('../controllers/tourControllers');
const reviewRouter = require('./reviewRoutes');
const { protect, allowOnlyTo } = require('../controllers/authControllers');

const tourRouter = express.Router();

tourRouter
    .route('/')
    .get(getAllTours)
    .post(protect, allowOnlyTo('admin', 'lead-guide'), createTour);

tourRouter.route('/top-5-cheap').get(aliasTopTour, getAllTours);

tourRouter.route('/tour-stats').get(getTourStats);

tourRouter
    .route('/tour-within/:distance/center/:latlng/unit/:unit')
    .get(getTourWithin);

tourRouter.route('/distances/:latlng/unit/:unit').get(getTourDistance);

tourRouter
    .route('/monthly-tour-plan/:year')
    .get(protect, allowOnlyTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

tourRouter
    .route('/:id')
    .get(getTour)
    .patch(
        protect,
        allowOnlyTo('admin', 'lead-guide'),
        uploadTourPhoto,
        resizeTourPhoto,
        updateTour
    )
    .delete(protect, allowOnlyTo('admin', 'lead-guide'), deleteTour);

tourRouter.use('/:tourId/reviews', reviewRouter);

module.exports = tourRouter;

// const { createReview } = require('../controllers/reviewControllers');

// tourRouter
//     .route('/:tourId/reviews')
//     .post(protect, allowOnlyTo('user'), createReview);
