const request = require('supertest');
const { app, server } = require('../server');
const Institucion = require('../modelos/Institucion');
const mongoose = require('mongoose');
const api = request(app);

const intituciones = [
    {
        codigoInstiticion: 802136547,
        nombreInstitucion: "INSTITUCION UNIVERSITARIA SALAZAR Y HERRERA",
        ciudad: "Medellin",
        departamento: "Antioquia",
        resolucion: "0124512",
        fechaResolucion: "1889-03-20T21:37:49.635+00:00",
        usuario: "64f77a5fabaae67a8534ccca"
    },
    {
        codigoInstiticion: 70142574,
        nombreInstitucion: "UNIVERSIDAD ESPERANZA PERDIDA",
        ciudad: "CALI",
        departamento: "VALLE DEL CAUCA",
        resolucion: "12347476",
        fechaResolucion: "1879-03-20T21:37:49.635+00:00",
        usuario: "64f77a5eabaae67a8534ccc8"
    },

]
describe('Pruebas de las rutas de diplomas', () => {

    beforeAll(async () => {
        await Institucion.deleteMany({codigoInstiticion: 20132010});

        /* const insti1 = new Institucion(intituciones[0])
        await insti1.save();

        const insti2 = new Institucion(intituciones[1])
        await insti2.save(); */
    });

    test('Listar las 2 instituciones', async () => {
        const response = await api
            .get('/api/institutions')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(intituciones.length);

    });

    test('Login necesario cuando se intenta crear institucion', async () => {

        const nuevaInstitucion = {
            codigoInstiticion: 20132010,
            nombreInstitucion: "Salazar Y Herrera Sede Monteria",
            ciudad: "Monteria",
            departamento: "Cundinamarca",
            resolucion: "20103641",
            fechaResolucion: "1879-03-20T21:37:49.635+00:00",
            usuario: "64f77a5fabaae67a8534ccca"
        }

        const res = await request(app)
                            .post('/api/institution/create')
                            .send(nuevaInstitucion)
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('msg', 'Login necesario' );
        // Agrega más expectativas para verificar la respuesta
    });

    /* test('Debe de devoler un diplomoa', async () => {
        const response = await api
            .get('/api/diploma/64f61fa14a7ffb0f83ce2fa3')
        expect(response.body).toBeNull()
        expect(response.body).to.have.any.keys('_id', 'codigoDiploma')
    }); */

    afterAll(() => {
        mongoose.connection.close();
        server.close();
    })
})