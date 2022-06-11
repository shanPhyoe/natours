const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsErrorDB = err => {
    const message = `The name: "${
        err.keyValue.name || err.keyValue.email
    }" already exists. Please insert different name!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const value = Object.values(err.errors)
        .map(el => el.message)
        .join('. ');
    const message = 'Invalid input: ' + value;
    return new AppError(message, 400);
};

const sendResDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: err.message,
    });
};

const sendResProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }

        return res.status(err.statusCode).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: err.message,
        });
    }

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: 'Please try again later.',
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        console.log(err);
        sendResDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsErrorDB(error);
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(error);

        sendResProd(error, req, res);
    }
};
