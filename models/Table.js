const mongoose = require('mongoose')
const Restaurant = require('./Restaurants')
const { Schema } = mongoose

const tableSchema = new Schema({
    id_restaurant: String,
    numero_table: Number,
    capacite_table: Number
})

tableSchema.post('save', async function (doc) {
    await Restaurant.findByIdAndUpdate(doc.id_restaurant, { $push: { tables: doc._id } });
});

const Table = mongoose.model('Table', tableSchema)

module.exports = Table