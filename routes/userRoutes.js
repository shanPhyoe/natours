const express = require('express');
const {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/userControllers');
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
} = require('../controllers/authControllers');

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
