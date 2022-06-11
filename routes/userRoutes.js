const express = require('express');

const {
    getAllUsers,
    getMe,
    getUser,
    createUser,
    updateMe,
    updateUser,
    deleteUser,
    deleteMe,
    uploadUserPhoto,
    resizeUserPhoto,
} = require('../controllers/userControllers');
const {
    signup,
    login,
    logout,
    protect,
    allowOnlyTo,
    forgotPassword,
    resetPassword,
    updatePassword,
} = require('../controllers/authControllers');

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.get('/logout', logout);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

userRouter.use(protect);

userRouter.route('/me').get(getMe, getUser);
userRouter.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
userRouter.delete('/deleteMe', deleteMe);
userRouter.patch('/updatePassword', updatePassword);

userRouter.use(allowOnlyTo('admin'));

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
