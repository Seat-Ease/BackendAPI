const Restaurant = require('../models/Restaurants')

class RestaurantService {
    static async createRestaurantAccount(req, res) {
        const result = await Restaurant.insertOne(req.body);
        return res.json(result)
    }
}

module.exports = RestaurantService