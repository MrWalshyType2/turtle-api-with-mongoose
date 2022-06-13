const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const turtleSchema = new Schema({
    size: {
        type: String,
        enum: ['LARGE', 'MEDIUM', 'SMALL'], // only valid values, can only be one of them
        trim: true, // remove whitespace
        required: [true, 'Size is required']
    },
    colour: {
        type: String,
        minlength: 4,
        maxlength: 16,
    },
    snappy: {
        type: Boolean,
        default: false
    },
    species: String,
    doesKungFu: {
        type: Boolean,
        default: false
    },
    born: {
        type: Date,
        required: [true, 'Birth date is required']
    },
    addresses: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Address',
            unique: true,
            select: false // don't get the data in the database by default
        }
    ]
});

const Turtle = mongoose.model('Turtle', turtleSchema);

module.exports = Turtle;