const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        photo: req.body.photo,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async function (req, res, next) {
    const { email, password } = req.body;

    // check whether the request contains email AND password
    if (!email || !password)
        return next(
            new AppError('Please provide email and password to log in.', 400)
        );

    // check the input email exists in DB or not
    const user = await User.findOne({ email }).select('+password');

    // return if input email is not existed in DB or input password is incorrect
    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError('Incorrect email or password', 401));

    // response with token if everying is in order
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // CHECK WHETHER REQUEST HAS TOKEN OR NOT
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
        return next(
            new AppError('You are not logged in. Please log in to get access.')
        );

    // TOKEN VERIFICATION
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // CHECK WHETHER USER IS DELETED OR NOT
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
        next(
            new AppError(
                'The user belonging to this token is no longer existed.',
                401
            )
        );

    // CHECK WHETHER USER CHANGED PASSWORD AFTER TOKEN IS ISSUED
    if (currentUser.tokenBeforeChangingPassword(decoded.iat))
        next(new AppError('Session expired. Please log in again.'));

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

exports.allowOnlyTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(
                new AppError(
                    'You do not have permission to perform this action.',
                    403
                )
            );

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // GET USER BASED ON REQUEST
    const user = await User.findOne({ email: req.body.email });

    if (!user)
        return next(
            new AppError('There is no user with that email address.', 404)
        );

    // GENERATE A RANDOM RESET TOKEN
    const resetToken = user.createPasswordResetToken();
    user.save({ validateBeforeSave: false });

    // SEND THE TOKEN TO USER'S EMAIL
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes).',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was an error sending the email. Please try again later!',
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {});
