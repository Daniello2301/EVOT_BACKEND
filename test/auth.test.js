const app = require('../server'); // Import your Express app
const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose'); // Import mongoose if you're using it for your database

describe('Authentication API Tests', () => {
    before((done) => {
        // Connect to a test database
        const uri = process.env.MONGO_URI;
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => done())
        .catch((err) => done(err));
    });

    after((done) => {
        // Disconnect and close the database connection after tests
        mongoose.disconnect()
            .then(() => done())
            .catch((err) => done(err));
    });

    it('should register a new user', (done) => {
        const newUser = {
            nombreUsuario:"NORMAL SUPERIOR",
            correo:"normal@mintic.edu.co",
            contraseña:"123456",
            rol:"INSTITUCION"
        };

        request(app)
            .post('/api/auth/register')
            .send(newUser)
            .expect(201)
            .end(async (err, res) => {
                if (err) return done(err);
                await expect(res.body).to.have.property('usuario');
                await expect(res.body.usuario.correo).to.equal(newUser.correo);
                done();
            });
    });

    it('should log in an existing user', (done) => {
        const userCredentials = {
            correo: 'ieprav@ieprav.edu.co',
            contraseña: '123456',
        };

        request(app)
            .post('/api/auth')
            .send(userCredentials)
            .expect(200)
            .end(async(err, res) => {
                if (err) return done(err);
                await expect(res.body).to.have.property('usuario');
                done();
            });
    });

    it("should warning message if your state is false", (done) => {
        const userCredentials = {
            correo: 'pio_XII@mintic.edu.co',
            contraseña: '123456',
        };

        request(app)
            .post('/api/auth')
            .send(userCredentials)
            .expect(401)
            .end(async(err, res) => {
                if (err) return done(err);
                await expect(res.body).to.have.property('msg');
                await expect(res.body.msg).to.equal('Verifica tu licencia');
                done();
            });
    })
});