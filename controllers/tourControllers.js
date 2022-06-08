const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('./handlerFactory');
const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');

exports.deleteTour = handler.deleteOne(Tour);
exports.createTour = handler.createOne(Tour);
exports.updateTour = handler.updateOne(Tour);
exports.getTour = handler.getOne(Tour, { path: 'reviews' });
exports.getAllTours = handler.getAll(Tour);

exports.aliasTopTour = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,difficulty,ratingsAverage,summary';
    next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatins: { $sum: '$ratingsQuantity' },
                avgRatings: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        stats,
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStart: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $sort: { numToursStart: -1 },
        },
        {
            $project: { _id: 0 },
        },
    ]);

    res.status(200).json({
        status: 'success',
        plan,
    });
});

exports.getTourWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng)
        return next(
            new AppError(
                'Please provide latitude and longitude in the format.',
                400
            )
        );

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] },
        },
    });

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours,
        },
    });
});

exports.getTourDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng)
        return next(
            new AppError(
                'Pleaseprovide latitude and longitude in the format.',
                400
            )
        );

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                name: 1,
                distance: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    });
});

// exports.checkId = (req, res, next, val) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Could not find the tour',
//         });
//     }
//     next();
// };

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Please add Tour Name and Price',
//         });
//     }
//     next();
// };

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour)
//         return next(new AppError("Could't find tour with that id!", 404));

//     res.status(204).json({
//         status: 'success',
//         data: null,
//     });
// });

// exports.createTour = catchAsync(async (req, res, next) => {
// const newTour = new Tour({});
// .save() is calling on new document
// newTour.save();
//SAME AS BELOW

// .create() is calling on collection
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour,
//         },
//     });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true, // to return the modified document rather than the original
//         runValidators: true,
//     });

//     if (!tour)
//         return next(new AppError("Could'nt find tour with that id!", 404));

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//     // Tour.findOne({_id: req.params.id})
//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     if (!tour)
//         return next(new AppError("Could't find tour with that id!", 404));

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

// exports.getAllTours = catchAsync(async (req, res, next) => {
//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();

//     // EXECUTING THE QUERY
//     const allTours = await features.query;

//     res.status(200).json({
//         // JSEND STANDARD
//         status: 'success',
//         results: allTours.length,
//         data: {
//             allTours,
//         },
//     });
// });
