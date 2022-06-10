import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapBox';
import { updateSettings } from './updateSettings';

if (document.querySelector('#map')) {
    const locations = JSON.parse(
        document.getElementById('map').dataset.locations
    );

    displayMap(locations);
}

document.querySelector('.form--login')?.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    login(email, password);
});

document.querySelector('.form-user-data')?.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;

    updateSettings({ name, email }, 'data');
});

document
    .querySelector('.form-user-settings')
    ?.addEventListener('submit', async e => {
        e.preventDefault();

        document.querySelector('.btn--save-password').textContent =
            'Updating...';

        const oldPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const newPasswordConfirm =
            document.getElementById('password-confirm').value;

        await updateSettings(
            { oldPassword, newPassword, newPasswordConfirm },
            'password'
        );

        document.querySelector('.btn--save-password').textContent =
            'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });

document.querySelector('.nav__el--logout')?.addEventListener('click', logout);
