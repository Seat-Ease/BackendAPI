const mongoose = require('mongoose')
const Disponibilite = require('../models/Disponibilite')

class DisponibiliteService {
    static async createAvailability(req, res) {
        try {
            const { date, heure, id_restaurant } = req.body
            if (!date || !heure || !id_restaurant) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" })
            const newAvailability = new Disponibilite()
            newAvailability.id_restaurant = id_restaurant
            newAvailability.date = date
            newAvailability.heure = heure
            newAvailability.reservee = false
            const availability = await Disponibilite.insertOne(newAvailability)
            return res.status(201).json(availability)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
    static async updateAvailability(req, res) {
        try {
            try {
                const availability = await Disponibilite.findByIdAndUpdate(req.params.id, req.body, { new: true })
                if (!availability) return res.status(404).json({ message: "Disponibilité non trouvée" })
                return res.status(200).json(availability)
            } catch (error) {
                return res.status(500).json({ message: "Erreur serveur" })
            }
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
    static async deleteAvailability(req, res) {
        try {
            try {
                const availability = await Disponibilite.findByIdAndDelete(req.params.id)
                if (!availability) return res.status(404).json({ message: "Disponibilité non trouvée" })
                return res.status(200).json({ message: "Disponibilité supprimée avec succès" })
            } catch (error) {
                return res.status(500).json({ message: "Erreur serveur" })
            }
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
}

module.exports = DisponibiliteService