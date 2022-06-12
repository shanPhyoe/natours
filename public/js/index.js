import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapBox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

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

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');

    window.setTimeout(() => {
        location.reload(true);
    }, 1000);
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

document.querySelector('#book-tour')?.addEventListener('click', async e => {
    e.target.textContent = 'Processing...';

    const { tourId } = e.target.dataset;

    await bookTour(tourId);
});

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 15);
