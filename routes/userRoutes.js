const express = require('express');
const {
    getAllUsers,
    getUser,
    createUser,
    updateMe,
    updateUser,
    deleteUser,
    deleteMe,
} = require('../controllers/userControllers');
const {
    signup,
    login,
    protect,
    forgotPassword,
    resetPassword,
    updatePassword,
} = require('../controllers/authControllers');

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);

userRouter.patch('/updatePassword', protect, updatePassword);
userRouter.patch('/updateMe', protect, updateMe);
userRouter.delete('/deleteMe', protect, deleteMe);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
