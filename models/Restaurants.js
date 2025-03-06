const mongoose = require('mongoose');
const { Schema } = mongoose

const restaurantSchema = new Schema({
    nom : String,
    courriel : String,
    adresse : String,
    telephone : String
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

module.exports = Restaurant