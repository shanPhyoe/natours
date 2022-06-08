const Review = require('../models/reviewModel');
const handler = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

exports.setUserAndTourId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.deleteReview = handler.deleteOne(Review);
exports.updateReview = handler.updateOne(Review);
exports.createReview = handler.createOne(Review);
exports.getReview = handler.getOne(Review);
exports.getAllReviews = handler.getAll(Review);
