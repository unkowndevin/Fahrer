"user strict";

const mongoose = require("mongoose")
const Schema = mongoose.Schema

mongoose.Promise = Promise;

const DiagnosticSchema = new Schema({
    sessionID: {
        type: Number,
        unique: true
    },
    results: {
        type: Array
    }
});

//ejecucion antes de cualquier accion

const User = mongoose.model('diagnostic', DiagnosticSchema);

module.exports = User;