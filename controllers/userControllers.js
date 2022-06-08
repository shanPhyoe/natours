const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handler = require('./handlerFactory');

exports.getUser = handler.getOne(User);
exports.getAllUsers = handler.getAll(User);
exports.deleteUser = handler.deleteOne(User);

//Do not update passwords with this!
exports.updateUser = handler.updateOne(User);

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

const filteredObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return next(
            new AppError(
                'This route is not for updating password. Please use /updatePassword.',
                400
            )
        );

    const filteredBody = filteredObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.createUser = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead.',
    });
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();

//     res.status(200).json({
//         status: 'success',
//         result: users.length,
//         data: {
//             users,
//         },
//     });
// });
