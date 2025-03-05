const request = require('supertest');
const app = require('../app'); // Assurez-vous que l'application Express est bien importée
const mongoose = require('mongoose');
const Employe = require('../models/Employe');
const Restaurant = require('../models/Restaurants');

describe('Tests des endpoints /employes', () => {
    let restaurantId;
    let employeId;

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Créer un restaurant pour lier les employés
        const restaurant = await Restaurant.collection.insertOne({
            nom: 'Restaurant Test',
            adresse: '123 Rue Test',
            telephone: '123-456-7890',
        });
        restaurantId = restaurant.insertedId;
    });

    afterAll(async () => {
        await Employe.deleteMany({});
        await Restaurant.deleteMany({});
        await mongoose.connection.close();
    });

    /**
     * Test de création d'un employé
     */
    test('POST /employes - Créer un employé', async () => {
        const response = await request(app)
            .post('/employes')
            .send({
                nom: 'Employé Test',
                email: 'employe@test.com',
                mot_de_passe: 'password123',
                role: 'serveur',
                id_restaurant: restaurantId
            })
            .expect(201);
        
        expect(response.body).toHaveProperty('_id');
        expect(response.body.nom).toBe('Employé Test');
        expect(response.body).not.toHaveProperty('mot_de_passe');
        employeId = response.body._id;
    });

    /**
     * Test de mise à jour d'un employé avec un ID inexistant
     */
    test("PUT /employes/:id - Erreur si l'employé n'existe pas", async () => {
        const response = await request(app)
            .put('/employes/660000000000000000000000')
            .send({ nom: 'Employé Inexistant' })
            .expect(404);
        
        expect(response.body.message).toBe('Employé non trouvé');
    });

    /**
     * Test de mise à jour avec un ID invalide
     */
    test("PUT /employes/:id - Erreur si l'ID est invalide", async () => {
        const response = await request(app)
            .put('/employes/invalidID')
            .send({ nom: 'Employé Test' })
            .expect(400);
        
        expect(response.body.message).toBe('ID invalide');
    });

    /**
     * Test de suppression d'un employé inexistant
     */
    test("DELETE /employes/:id - Erreur si l'employé n'existe pas", async () => {
        const response = await request(app)
            .delete('/employes/660000000000000000000000')
            .expect(404);
        
        expect(response.body.message).toBe('Employé non trouvé');
    });

    /**
     * Test de récupération d'un employé avec un ID inexistant
     */
    test("GET /employes/:id - Erreur si l'employé n'existe pas", async () => {
        const response = await request(app)
            .get('/employes/660000000000000000000000')
            .expect(404);
        
        expect(response.body.message).toBe('Employé non trouvé');
    });

    /**
     * Test de récupération avec un ID invalide
     */
    test("GET /employes/:id - Erreur si l'ID est invalide", async () => {
        const response = await request(app)
            .get('/employes/invalidID')
            .expect(400);
        
        expect(response.body.message).toBe('ID invalide');
    });

    /**
     * Test de liaison entre un employé et un restaurant avec un ID de restaurant invalide
     */
    test("POST /employes - Erreur si le restaurant n'existe pas", async () => {
        const response = await request(app)
            .post('/employes')
            .send({
                nom: 'Employé Test',
                email: 'employe.erreur@test.com',
                mot_de_passe: 'password123',
                role: 'serveur',
                id_restaurant: '660000000000000000000000'
            })
            .expect(404);
        
        expect(response.body.message).toBe('Restaurant non trouvé');
    });
});