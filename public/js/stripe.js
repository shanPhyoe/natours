import axios from 'axios';

import { showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51L9GepE7k6rrzTQ3WbQKhv3r7vk7Bsxy6EOtQNuGZPukilDLb7uOVxzaAcagUqys0y5hMW9fq6OBcs6RGupf4g6N00F8I58sL2'
);

export const bookTour = async tourId => {
    try {
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (err) {
        // console.log(err);
        showAlert(`Error: ${err.message}`);
    }
};
