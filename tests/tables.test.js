const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Employe = require('../models/Employe');
const Restaurant = require('../models/Restaurants');
const Table = require('../models/Table');

describe('Tests des endpoints /tables', () => {
    let restaurantId;
    let adminToken;
    let regularToken;
    let tableId;

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Créer un restaurant avec un admin via l'API
        const response = await request(app)
            .post('/restaurants')
            .send({
                info_restaurant: {
                    nom: 'Restaurant Test',
                    courriel: 'info@restaurantTest.ca',
                    adresse: '123 Rue Test',
                    telephone: '123-456-7890'
                },
                info_admin: {
                    nom: 'Admin Test',
                    email: 'admin@restaurantTest.ca',
                    mot_de_passe: 'password123',
                    telephone: '987-654-3210'
                }
            })
            .expect(201);
        
        restaurantId = response.body.restaurant._id;

        // Connexion avec l'admin
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@restaurantTest.ca',
                mot_de_passe: 'password123'
            })
            .expect(200);
        adminToken = loginResponse.headers['set-cookie'];

        // Créer un employé régulier
        const regularResponse = await request(app)
            .post('/employes')
            .set('Cookie', adminToken)
            .send({
                nom: 'Employé Test',
                email: 'employe@test.com',
                mot_de_passe: 'password123',
                role: 'regular',
                id_restaurant: restaurantId
            })
            .expect(201);
        
        // Connexion avec l'employé régulier
        const loginRegularResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'employe@test.com',
                mot_de_passe: 'password123'
            })
            .expect(200);
        regularToken = loginRegularResponse.headers['set-cookie'];
    });

    afterAll(async () => {
        await Table.deleteMany({});
        await Employe.deleteMany({});
        await Restaurant.deleteMany({});
        await mongoose.connection.close();
    });

    /**
     * Test de création d'une table (Admin requis)
     */
    test('POST /restaurants/tables - Un admin peut créer une table', async () => {
        const response = await request(app)
            .post(`/restaurants/${restaurantId}/tables`)
            .set('Cookie', adminToken)
            .send({
                id_restaurant: restaurantId,
                numero_table: 1,
                capacite_table: 4
            })
            .expect(201);
        
        expect(response.body).toHaveProperty('_id');
        tableId = response.body._id;

        // Test pour se rassurer que la table est ajoutée dans la liste de tables du restaurant
        const restaurantResponse = await request(app)
            .get(`/restaurants/${restaurantId}/tables/${tableId}`)
            .expect(200);
        
        expect(restaurantResponse.body._id).toBe(tableId);
    });

    test('POST /restaurants/tables - Un employé régulier ne peut pas créer une table', async () => {
        const response = await request(app)
            .post(`/restaurants/${restaurantId}/tables`)
            .set('Cookie', regularToken)
            .send({
                numero_table: 2,
                capacite_table: 2,
                id_restaurant: restaurantId
            })
            .expect(401);
        
        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });

    test('POST /restaurants/tables - Erreur si des champs sont manquants', async () => {
        const response = await request(app)
            .post(`/restaurants/${restaurantId}/tables`)
            .set('Cookie', adminToken)
            .send({})
            .expect(400);
        
        expect(response.body.message).toBe("Tous les champs requis doivent être fournis");
    });

    /**
     * Test de modification d'une table (Admin requis)
     */
    test('PUT /restaurants/tables/:id - Un admin peut modifier une table', async () => {
        const response = await request(app)
            .put(`/restaurants/${restaurantId}/tables/${tableId}`)
            .set('Cookie', adminToken)
            .send({ capacite_table: 6 })
            .expect(200);
        
        expect(response.body.capacite_table).toBe(6);
    });

    test('PUT /restaurants/tables/:id - Un employé régulier ne peut pas modifier une table', async () => {
        const response = await request(app)
            .put(`/restaurants/${restaurantId}/tables/${tableId}`)
            .set('Cookie', regularToken)
            .send({ capacite_table: 8 })
            .expect(401);
        
        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });

    /**
     * Test de suppression d'une table (Admin requis)
     */
    test('DELETE /restaurants/tables/:id - Un admin peut supprimer une table', async () => {
        await request(app)
            .delete(`/restaurants/${restaurantId}/tables/${tableId}`)
            .set('Cookie', adminToken)
            .expect(200);
    });

    test('DELETE /restaurants/tables/:id - Un employé régulier ne peut pas supprimer une table', async () => {
        const response = await request(app)
            .delete(`/restaurants/${restaurantId}/tables/${tableId}`)
            .set('Cookie', regularToken)
            .expect(401);
        
        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });
});
