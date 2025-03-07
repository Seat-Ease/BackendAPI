const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Employe = require('../models/Employe');
const Restaurant = require('../models/Restaurants');
const jwt = require('jsonwebtoken');

describe('Tests des endpoints /auth/login', () => {
    let employeId;
    let restaurantId;

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Créer un restaurant et un employé admin via l'API
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
        employeId = response.body.admin._id;
    });

    afterAll(async () => {
        await Employe.deleteMany({});
        await Restaurant.deleteMany({});
        await mongoose.connection.close();
    });

    /**
     * Test de connexion réussie avec cookie http-only
     */
    test('POST /auth/login - Connexion réussie', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@restauranttest.ca',
                mot_de_passe: 'password123',
            })
            .expect(200);

        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.body).toHaveProperty('employe');
        expect(response.body.employe.email).toBe('admin@restauranttest.ca');
        expect(response.body).toHaveProperty('restaurant');
        expect(response.body.restaurant.nom).toBe('Restaurant Test');
    });

    /**
     * Test de connexion avec un email incorrect
     */
    test("POST /auth/login - Erreur si l'email est incorrect", async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'wrong@test.com',
                mot_de_passe: 'password123',
            })
            .expect(401);

        expect(response.body.message).toBe('Email ou mot de passe incorrect');
    });

    /**
     * Test de connexion avec un mot de passe incorrect
     */
    test('POST /auth/login - Erreur si le mot de passe est incorrect', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@restauranttest.ca',
                mot_de_passe: 'wrongpassword',
            })
            .expect(401);

        expect(response.body.message).toBe('Email ou mot de passe incorrect');
    });

    /**
     * Test de connexion avec des champs manquants
     */
    test('POST /auth/login - Erreur si des champs sont manquants', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@restauranttest.ca' })
            .expect(400);

        expect(response.body.message).toBe('Email et mot de passe sont requis');
    });

    /**
     * Test de token expiré après 24h
     */
    test('GET /auth/verify - Erreur si le token est expiré', async () => {
        const expiredToken = jwt.sign({ id: employeId }, process.env.JWT_SECRET, { expiresIn: '-1s' });
        const response = await request(app)
            .get('/auth/verify')
            .set('Cookie', `authToken=${expiredToken}`)
            .expect(401);

        expect(response.body.message).toBe('Token expiré, veuillez vous reconnecter');
    });
});