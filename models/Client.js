const mongoose = require('mongoose');
const { Schema } = mongoose

const clientSchema = new Schema({
    nom : String,
    email : String,
    telephone : String
})

const Client = mongoose.model('Client', clientSchema);

module.exports = Client