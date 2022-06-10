const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const turtleSchema = new Schema({
    size: String,
    colour: String,
    snappy: Boolean,
    species: String,
    doesKungFu: Boolean,
    born: Date
});

const Turtle = mongoose.model('Turtle', turtleSchema);

module.exports = Turtle;

// {
//     size: "LARGE",
//     colour: "RED",
//     snappy: false,
//     species: "leatherback",
//     doesKungFu: true,
//     born: new Date('1989-05-22')
// }