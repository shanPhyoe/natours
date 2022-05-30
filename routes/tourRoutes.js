const express = require('express');
const {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    // checkId,
    // checkBody,
} = require('../controllers/tourControllers');

const tourRouter = express.Router();

// tourRouter.param('id', checkId);

tourRouter.route('/').get(getAllTours).post(createTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = tourRouter;
