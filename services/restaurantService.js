const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurants')
class RestaurantService {
    static async createRestaurantAccount(req, res) {
        try {
            const { nom, adresse, telephone } = req.body;
            if (!nom || !adresse || !telephone) return res.status(400).json({ message: "Tous les champs requis doivent être fournis" })
            const result = await Restaurant.insertOne({ nom, adresse, telephone })
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async getRestaurants(req, res) {
        try {
            const restaurants = await Restaurant.find({});
            return res.status(200).json(restaurants)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async getSpecificRestaurant(req, res) {
        try {
            const restaurant = await Restaurant.findById(req.params.id)
            if (!restaurant) return res.status(404).json({ message: "Restaurant non trouvé" })
            return res.status(200).json(restaurant)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async updateRestaurant(req, res) {
        try {
            const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true })
            if (!restaurant) return res.status(404).json({ message: "Restaurant non trouvé" })
            return res.status(200).json(restaurant)
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    static async deleteRestaurant(req, res) {
        try {
            const restaurant = await Restaurant.findByIdAndDelete(req.params.id)
            if (!restaurant) return res.status(404).json({ message: "Restaurant non trouvé" })
            return res.status(200).json({ message: "Restaurant supprimé avec succès" })
        } catch (error) {
            return res.status(500).json({ message: "Erreur serveur" })
        }
    }
}

module.exports = RestaurantService