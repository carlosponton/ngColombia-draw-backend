const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const personSchema = new Schema({
    cc: String,
    winner: Boolean,
    name: String,
    comment: String,
});

module.exports.Person = mongoose.model('Persons', personSchema);
