const { app, server } = require('../server');
const request = require('supertest');
const Usuario = require('../modelos/Usuario');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


const api = request(app);

const usuarios = [
    {
        nombreUsuario: "Esperanza Perdido",
        correo: "Esperanza@mintic.edu.co",
        contraseña: "123456",
        rol: "INSTITUCION"
    },
    {
        nombreUsuario: "Salazar Y Herrera",
        correo: "IUSH@mintic.edu.co",
        contraseña: "123456",
        rol: "INSTITUCION"
    }
]

describe('Authentication API Tests', () => {
    beforeAll(async () => {
        await Usuario.deleteMany({ correo: "normal@mintic.edu.co" });

         /* let usu1 = new Usuario(usuarios[0]);
        const salt = bcrypt.genSaltSync(10);
        const contraseñaEncriptada = bcrypt.hashSync(usu1.contraseña, salt);
        usu1.contraseña = contraseñaEncriptada;
        await usu1.save();

        let usu2 = new Usuario(usuarios[1]);
        const contraseñaEncriptada2 = bcrypt.hashSync(usu2.contraseña, salt);
        usu2.contraseña = contraseñaEncriptada2;
         await usu2.save(); */
    })

    afterAll(() => {
        mongoose.connection.close();
        server.close();
    })

    test('Listar usuarios', async () => {
        const res = await api.get('/api/users');
        expect(res.body).toHaveLength(2);
    })


    test('should register a new user', async () => {
        const newUser = {
            nombreUsuario: "NORMAL SUPERIOR",
            correo: "normal@mintic.edu.co",
            contraseña: "123456",
            rol: "INSTITUCION"
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(newUser)
            .expect(201)

        expect(response.body.usuario.nombreUsuario).toEqual(newUser.nombreUsuario);
        expect(response.body.msg).toEqual(expect.stringMatching("Registro Existos!"));
    });

    test('should log in an existing user', async () => {
        const userCredentials = {
            correo: 'IUSH@mintic.edu.co',
            contraseña: '123456',
        };

        const response = await api
            .post('/api/auth')
            .send(userCredentials)
            .expect(200)

        expect(response.body.msg).toEqual(expect.stringMatching("Logueo Existos!"));
    });

    test("Muestra mensaje de credenciales incorrectas", async () => {
        const userCredentials = {
            correo: 'IUSH@mintic.edu.co',
            contraseña: 'IUSH123456',
        };

        const res = await api
            .post('/api/auth')
            .send(userCredentials)
            .expect(401);
        expect(res.body.msg).toEqual(expect.stringMatching("Correo o Contraseña incorrecta"))
    })

    test("Desactivar usuario", async() =>{
        const id = "64f77a5eabaae67a8534ccc8"
        const res = await api
            .put(`/api/deactivate/user/64f77a5eabaae67a8534ccc8`)
            .expect(200)
            expect(res.body.msg).toEqual(expect.stringMatching("Desactivacion Existos!"))
    })
});