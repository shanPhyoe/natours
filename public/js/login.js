import axios from 'axios';

import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password,
            },
        });
        // console.log(res);
        if (res.data.status === 'success') {
            showAlert(res.data.status, 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert(err.response.data.status, err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        });

        if (res.data.status === 'success') location.reload(true);
    } catch (err) {
        showAlert('fail', 'Error in logging out. Please try again!');
    }
};
