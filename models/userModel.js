const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell use your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                // "this" only works on CREATE and SAVE!
                return el === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

userSchema.pre('save', async function (next) {
    //only run this function when password field is going to be modified
    if (!this.isModified('password')) return next();

    // hashing the password with the cost of 12(the higher the more strongly encrypted)
    this.password = await bcrypt.hash(this.password, 12);

    // removing passwordConfirm field so that it won't be saved in DB
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    actualPassword
) {
    return await bcrypt.compare(candidatePassword, actualPassword);
};

userSchema.methods.tokenBeforeChangingPassword = function (tokenTimeStamp) {
    if (this.passwordChangedAt) {
        // JWT timeStamp is in seconds
        // converting timeStamp in seconds
        const passwordChangedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return passwordChangedTimeStamp > tokenTimeStamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    // console.log(
    //     { resetToken },
    //     this.passwordResetToken,
    //     this.passwordResetTokenExpires
    // );

    return resetToken;
};

userSchema.pre(/^find/, function (next) {
    // "this" points to current querying object
    this.find({ active: { $ne: false } });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
