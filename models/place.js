"use strict";

//modulos escenciales
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.Promise = Promise;

const PlaceShema = new Schema({
    abbr: {
        type: String,
        required: [true, "Este campo es requerido"],
        unique: true
    },
    name: {
        type: String,
        required: [true, "Este Campo es obligatorio"],
        unique: true
    }
});

const Place = mongoose.model('place', PlaceShema);

module.exports = Place;