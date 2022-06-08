const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc)
            return next(
                new AppError("Could't find document with that id!", 404)
            );

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // to return the modified document rather than the original
            runValidators: true,
        });

        if (!doc)
            return next(
                new AppError("Couldn't find document with that id!", 404)
            );

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        // Tour.findOne({_id: req.params.id})
        let query = Model.findById(req.params.id);
        if (populateOptions) query = query.populate(populateOptions);

        const doc = await query;

        if (!doc)
            return next(
                new AppError("Could't find document with that id!", 404)
            );

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        // EXECUTING THE QUERY
        // const allDocs = await features.query.explain();
        const allDocs = await features.query;

        res.status(200).json({
            // JSEND STANDARD
            status: 'success',
            results: allDocs.length,
            data: {
                data: allDocs,
            },
        });
    });
