const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const product = await stripe.products.create({
        name: tour.name,
        description: tour.summary,
        images: [`/img/tours/${tour.imageCover}`],
    });

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/?tour=${
            req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    product: product.id,
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                },
                quantity: 1,
            },
        ],
    });

    res.status(200).json({
        status: 'success',
        session,
    });
});

exports.createCheckoutBooking = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour || !user || !price) return next();

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});
