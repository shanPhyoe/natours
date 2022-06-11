const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
});

exports.getTourDetails = catchAsync(async (req, res, next) => {
    const { tourSlug } = req.params;

    const tour = await Tour.findOne({ slug: tourSlug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });

    if (!tour)
        return next(new AppError('There is no tour with that name.', 404));

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    });
});

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });

    const toursId = bookings.map(booking => booking.tour);

    const bookedTours = await Tour.find({ _id: { $in: toursId } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours: bookedTours,
    });
});
