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
    // checkId,
    // checkBody,
} = require('../controllers/tourControllers');
const { protect, allowOnlyTo } = require('../controllers/authControllers');

const tourRouter = express.Router();

// tourRouter.param('id', checkId);

tourRouter.route('/top-5-cheap').get(aliasTopTour, getAllTours);

tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-tour-plan/:year').get(getMonthlyPlan);

tourRouter.route('/').get(protect, getAllTours).post(createTour);

tourRouter
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(protect, allowOnlyTo('admin', 'lead-guide'), deleteTour);

module.exports = tourRouter;
