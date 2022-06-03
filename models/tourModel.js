const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
        },
        secretTour: {
            type: String,
            default: false,
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty must be either easy, medium or difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating average must be above or equal to 1'],
            max: [5, 'Rating average must be below or equal to 5'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
            min: [1, 'A tour price must be greater than 0'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message:
                    'Discount price ${VALUE} should be less than regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.virtual('durationInWeek').get(function () {
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: pre will run before .save() and .create
// "this" refers to processing document
// ** must call next() to proceed to next middleware **
// tourSchema.pre('save', function (next) {
//     console.log('Document will be saved!');
//     console.log(this);
//     next();
// });

// DOCUMENT MIDDLEWARE: post will run after .save() and .create
// doc refers to processed document
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     console.log('Document saved successfully!');
//     next();
// });

// QUERY MIDDLEWARE: pre will run before find methods
// "this" refers to processing query
tourSchema.pre(/^find/, function (next) {
    // this.start = Date.now();
    // console.log(this);
    this.find({ secretTour: { $ne: true } });
    next();
});

// QUERY MIDDLEWARE: post will run after find methods
// docs refers to processed query
// tourSchema.post(/^find/, function (docs, next) {
//     console.log(`The query took ${Date.now() - this.start} milliseconds!`);
// console.log(docs);
//     next();
// });

// AGGREGATION MIDDLEWARE: pre will run before .aggregate()
// this refers to aggregation object in which pipeline() exists
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
