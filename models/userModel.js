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

userSchema.methods.correctPassword = async function (
    candidatePassword,
    actualPassword
) {
    return await bcrypt.compare(candidatePassword, actualPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
