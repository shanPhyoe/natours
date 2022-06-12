const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createAndSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
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

    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser, url).sendWelcome();

    createAndSendToken(newUser, 201, req, res);
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
    createAndSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 3000),
        httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
    });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // CHECK WHETHER REQUEST HAS TOKEN OR NOT
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token)
        return next(
            new AppError(
                'You are not logged in. Please log in to get access.',
                400
            )
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
        next(new AppError('Session expired. Please log in again.', 440));

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            // TOKEN VERIFICATION
            const decoded = await jwt.verify(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // CHECK WHETHER USER IS DELETED OR NOT
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) return next();

            // CHECK WHETHER USER CHANGED PASSWORD AFTER TOKEN IS ISSUED
            if (currentUser.tokenBeforeChangingPassword(decoded.iat))
                return next();

            // GRANT ACCESS TO PROTECTED ROUTE
            res.locals.user = currentUser;
        }
        return next();
    } catch (err) {
        return next();
    }
};

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

    try {
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your password reset token (valid for 10 minutes).',
        //     message,
        // });

        // SEND THE TOKEN TO USER'S EMAIL
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();

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

exports.resetPassword = catchAsync(async (req, res, next) => {
    // GET USER BASED ON THE TOKEN
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user)
        return next(new AppError('Invalid token or token expired!', 400));

    // IF TOKEN HAS NOT EXPIRED AND THERE IS USER, SET NEW PASSWORD
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    // UPDATE changedPasswordAt PROPERTY FOR THE USER
    // *performed in pre"save"  hook on userSchema

    // LOG THE USER IN, SEND JWT
    createAndSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // GET USER FROM COLLECTION
    const user = await User.findById(req.user.id).select('+password');

    // CHECK IF POSTed CURRENT PASSWORD IS CORRECT
    if (!(await user.correctPassword(req.body.oldPassword, user.password)))
        return next(new AppError('Your old password is not correct.', 401));

    // IF SO, UPDATE PASSWORD
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    // LOG USER IN, SEND JWT
    createAndSendToken(user, 200, req, res);
});
