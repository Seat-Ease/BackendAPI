const mongoose = require('mongoose')
const { Schema } = mongoose

const tableSchema = new Schema({
    id_restaurant: String,
    numero_table: Number,
    capacite_table: Number
})

const Table = mongoose.model('Table', tableSchema)

module.exports = Table