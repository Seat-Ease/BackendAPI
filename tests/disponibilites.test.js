const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Employe = require('../models/Employe');
const Restaurant = require('../models/Restaurants');
const Disponibilite = require('../models/Disponibilite');

describe('Tests des endpoints /disponibilites', () => {
    let restaurantId;
    let adminToken;
    let regularToken;
    let disponibiliteId;
    let disponibiliteId1, disponibiliteId2, disponibiliteId3;
    let today, tomorrow;

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        today = new Date().toISOString().split('T')[0];
        tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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

        // Ajouter plusieurs disponibilités
        const disponibilite1 = await request(app)
            .post(`/restaurants/${restaurantId}/disponibilites`)
            .set('Cookie', adminToken)
            .send({ date: today, heure: '18:00', id_restaurant: restaurantId })
            .expect(201);
        disponibiliteId1 = disponibilite1.body._id;

        const disponibilite2 = await request(app)
            .post(`/restaurants/${restaurantId}/disponibilites`)
            .set('Cookie', adminToken)
            .send({ date: today, heure: '20:00', id_restaurant: restaurantId })
            .expect(201);
        disponibiliteId2 = disponibilite2.body._id;

        const disponibilite3 = await request(app)
            .post(`/restaurants/${restaurantId}/disponibilites`)
            .set('Cookie', adminToken)
            .send({ date: tomorrow, heure: '19:00', id_restaurant: restaurantId })
            .expect(201);
        disponibiliteId3 = disponibilite3.body._id;
    });

    afterAll(async () => {
        await Disponibilite.deleteMany({});
        await Employe.deleteMany({});
        await Restaurant.deleteMany({});
        await mongoose.connection.close();
    });

    /**
     * Test de création d'une disponibilité (Admin requis)
     */
    test('POST /disponibilites - Un admin peut créer une disponibilité', async () => {
        const response = await request(app)
            .post(`/restaurants/${restaurantId}/disponibilites`)
            .set('Cookie', adminToken)
            .send({
                date: '2025-03-10',
                heure: '18:00',
                id_restaurant: restaurantId
            })
            .expect(201);
        
        expect(response.body).toHaveProperty('_id');
        disponibiliteId = response.body._id;
    });

    test('POST /disponibilites - Un employé régulier ne peut pas créer une disponibilité', async () => {
        const response = await request(app)
            .post(`/restaurants/${restaurantId}/disponibilites`)
            .set('Cookie', regularToken)
            .send({
                date: '2025-03-11',
                heure: '19:00',
                id_restaurant: restaurantId
            })
            .expect(401);
        
        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });

    /**
     * Test de récupération des disponibilités d'un restaurant
     */
    test('GET /disponibilites/:id_restaurant - Récupérer toutes les disponibilités (par défaut)', async () => {
        const response = await request(app)
            .get(`/restaurants/${restaurantId}/disponibilites`)
            .expect(200);
        
        expect(response.body.length).toBe(2);
    });

    test('GET /disponibilites/:id_restaurant - Filtrer par date', async () => {
        const response = await request(app)
            .get(`/restaurants/${restaurantId}/disponibilites?date=${tomorrow}`)
            .expect(200);
        
        expect(response.body.length).toBe(1);
    });

    /**
     * Test de modification d'une disponibilité (Admin requis)
     */
    test('PUT /disponibilites/:id - Un admin peut modifier une disponibilité', async () => {
        const response = await request(app)
            .put(`/restaurants/${restaurantId}/disponibilites/${disponibiliteId}`)
            .set('Cookie', adminToken)
            .send({ heure: '20:00' })
            .expect(200);
        
        expect(response.body.heure).toBe('20:00');
    });

    test('PUT /disponibilites/:id - Un employé régulier ne peut pas modifier une disponibilité', async () => {
        const response = await request(app)
            .put(`/restaurants/${restaurantId}/disponibilites/${disponibiliteId}`)
            .set('Cookie', regularToken)
            .send({ heure: '21:00' })
            .expect(401);
        
        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });

    /**
     * Test de suppression d'une disponibilité (Admin requis)
     */
    test('DELETE /disponibilites/:id - Un admin peut supprimer une disponibilité', async () => {
        await request(app)
            .delete(`/restaurants/${restaurantId}/disponibilites/${disponibiliteId}`)
            .set('Cookie', adminToken)
            .expect(200);
    });

    test('DELETE /disponibilites/:id - Un employé régulier ne peut pas supprimer une disponibilité', async () => {
        const response = await request(app)
            .delete(`/restaurants/${restaurantId}/disponibilites/${disponibiliteId}`)
            .set('Cookie', regularToken)
            .expect(401);
        
        expect(response.body.message).toBe("Vous n'êtes pas autorisé à faire cette action");
    });
});
