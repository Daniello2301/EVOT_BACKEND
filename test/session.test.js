const request = require('supertest');
const { app, server } = require('../server');
const Institucion = require('../modelos/Institucion');
let Keygrip = require('keygrip');
let Buffer = require('safe-buffer').Buffer;
const mongoose = require('mongoose');
const api = request(app);

describe("Test for endpoints use express-session", () => {

    beforeAll(async () => {
        await Institucion.deleteMany({ codigoInstiticion: 20132010 });
    });

    test("Create a Institucion", async () => {

        const usuarioSession = {
            correo: "IUSH@mintic.edu.co",
            rol: "INSTITUCION",
            _id: "64f77a5fabaae67a8534ccca",
            institucion: "64f795a3dfdc98506407b2d8"
        }

        let cookie = Buffer.from(JSON.stringify(usuarioSession)).toString('base64'); // base64 converted value of cookie  
        let kg = Keygrip(['evot-project IEPRAV']); // same key as your are using in app
        let hash = kg.sign('my-session' + '=' + cookie);


        const nuevaInstitucion = {
            codigoInstiticion: 20132010,
            nombreInstitucion: "Salazar Y Herrera Sede Monteria",
            ciudad: "Monteria",
            departamento: "Cundinamarca",
            resolucion: "20103641",
            fechaResolucion: "1879-03-20T21:37:49.635+00:00",
            usuario: "64f77a5fabaae67a8534ccca"
        }

        const response = await api
            .post('/api/institution/create')
            .set('cookie', [`my-session=${cookie + '; ' + 'my-session.sig=' + hash + ';'}`])
            .send(nuevaInstitucion)

        expect(response.statusCode).toBe(400)
    });

    afterEach(() => {
        mongoose.connection.close();
        server.close();
    })
});