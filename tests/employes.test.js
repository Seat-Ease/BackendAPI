const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Employe = require('../models/Employe');
const Restaurant = require('../models/Restaurants');

describe('Tests des endpoints /employes', () => {
    let restaurantId;
    let adminId;
    let employeId;
    let adminToken;
    let regularToken;

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
                    courriel: 'info@restauranttest.ca',
                    adresse: '123 Rue Test',
                    telephone: '123-456-7890'
                },
                info_admin: {
                    nom: 'Admin Test',
                    email: 'admin@restauranttest.ca',
                    mot_de_passe: 'password123',
                    telephone: '987-654-3210',
                    role: 'admin'
                }
            })
            .expect(201);

        restaurantId = response.body.restaurant._id;
        adminId = response.body.admin._id;

        // Se connecter avec l'admin
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@restauranttest.ca',
                mot_de_passe: 'password123',
            })
            .expect(200);
        adminToken = loginResponse.headers['set-cookie'];

        // Créer un employé regular avec l'admin
        const employeResponse = await request(app)
            .post('/employes')
            .set('Cookie', adminToken)
            .send({
                nom: 'Employé Test',
                email: 'employe@test.com',
                mot_de_passe: 'password456',
                role: 'regular',
                telephone: '988-653-3217',
                id_restaurant: restaurantId
            })
            .expect(201);
        employeId = employeResponse.body._id;

        // Se connecter avec l'employé regular
        const loginRegularResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'employe@test.com',
                mot_de_passe: 'password456',
            })
            .expect(200);
        regularToken = loginRegularResponse.headers['set-cookie'];
    });

    afterAll(async () => {
        await Employe.deleteMany({});
        await Restaurant.deleteMany({});
        await mongoose.connection.close();
    });

    /**
     * Test d'accès refusé pour un utilisateur non authentifié
     */
    test('POST /employes - Erreur si utilisateur non authentifié', async () => {
        const response = await request(app)
            .post('/employes')
            .send({
                nom: 'Sans Auth',
                email: 'noauth@test.com',
                mot_de_passe: 'password123',
                role: 'regular',
                id_restaurant: restaurantId
            })
            .expect(401);
        
        expect(response.body.message).toBe('Token manquant');
    });

    test('PUT /employes/:id - Erreur si utilisateur non authentifié', async () => {
        const response = await request(app)
            .put(`/employes/${employeId}`)
            .send({ nom: 'Tentative Sans Auth' })
            .expect(401);
        
        expect(response.body.message).toBe('Token manquant');
    });

    test('DELETE /employes/:id - Erreur si utilisateur non authentifié', async () => {
        const response = await request(app)
            .delete(`/employes/${employeId}`)
            .expect(401);
        
        expect(response.body.message).toBe('Token manquant');
    });

    test('GET /employes/:id - Erreur si utilisateur non authentifié', async () => {
        const response = await request(app)
            .get(`/employes/${employeId}`)
            .expect(401);
        
        expect(response.body.message).toBe('Token manquant');
    });

    /**
     * Tests existants avec authentification
     */
    test('POST /employes - Un admin peut créer un employé', async () => {
        const response = await request(app)
            .post('/employes')
            .set('Cookie', adminToken)
            .send({
                nom: 'Nouvel Employé',
                email: 'newemploye@test.com',
                mot_de_passe: 'password123',
                role: 'regular',
                id_restaurant: restaurantId
            })
            .expect(201);

        expect(response.body).toHaveProperty('_id');
    });

    test('DELETE /employes/:id - Un employé regular ne peut pas supprimer un employé', async () => {
        const response = await request(app)
            .delete(`/employes/${employeId}`)
            .set('Cookie', regularToken)
            .expect(401);

        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });

    test('GET /employes/:id - Un employé peut voir ses propres informations', async () => {
        const response = await request(app)
            .get(`/employes/${employeId}`)
            .set('Cookie', regularToken)
            .expect(200);

        expect(response.body).toHaveProperty('_id', employeId);
    });
});
