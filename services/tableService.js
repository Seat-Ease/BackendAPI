const mongoose = require('mongoose')
const Table = require('../models/Table')

class TableService {
    static async createTable(req, res) {
        try {
            const { id_restaurant, numero_table, capacite_table } = req.body
            if (!id_restaurant || !capacite_table || !numero_table) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" })
            const table = await Table.insertOne(req.body);
            return res.status(201).json(table)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
    static async getRestaurantTables(req, res) {
        try {
            const tables = await Table.find({ id_restaurant: req.params.id_restaurant })
            return res.status(200).json(tables)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
    static async getSpecificRestaurantTable(req, res) {
        try {
            const table = await Table.findById(req.params.id_table)
            return res.status(200).json(table)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
    static async updateTable(req, res) {
        try {
            const table = await Table.findByIdAndUpdate(req.params.id_table, req.body, { new: true })
            if (!table) return res.status(404).json({ message: "Table non trouvée" })
            return res.status(200).json(table)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
    static async deleteTable(req, res) {
        try {
            const table = await Table.findByIdAndDelete(req.params.id_table)
            if (!table) return res.status(404).json({ message: "Table non trouvée" })
            return res.status(200).json({ message: "Table supprimée avec succès" })
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
}

module.exports = TableService