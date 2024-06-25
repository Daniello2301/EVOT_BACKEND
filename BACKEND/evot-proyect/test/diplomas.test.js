const request = require('supertest');
const { app, server} = require('../server');
const Diploma = require('../modelos/Diploma');
const mongoose = require('mongoose');
const api = request(app);

const diplomas = [
    {
        codigoDiploma: "02132541",
        nombrePrograma: "Ingenieria en Desarrollo de Software",
        nivelPrograma: "Carrera Profesional",
        registroPrograma: "HSO098FS-21",
        libro: "25",
        fechaGrados: "2022-09-20T21:43:12.766Z",
        estado: true,
        graduado: 1007243602,
        institucion: '64ed0423ecce11e78aa60474'
    },
    {
        codigoDiploma: "1021412",
        nombrePrograma: "Ingenieria en Sistemas",
        nivelPrograma: "Carrera Profesional",
        registroPrograma: "OIÑL8546AGEa",
        libro: "30",
        fechaGrados: "2022-09-20T21:43:12.766Z",
        estado: true,
        graduado: 1007243602,
        institucion: '64ed0423ecce11e78aa60474'
    },

]
describe('Pruebas de las rutas de diplomas', () => {

    beforeEach(async() =>{
        await Diploma.deleteMany({});

        const diploma1 = new Diploma(diplomas[0])
        await diploma1.save();

        const diploma2 = new Diploma(diplomas[1])
        await diploma2.save();
    });

    test.skip('Debe de devoler un json', async () => {
        await api
            .get('/api/diplomas')
            .expect(404)
            .expect('Content-Type', /application\/json/)

    });

    test.skip('Debería listar 2 diplomas', async () => {
        const res = await api.get('/api/diplomas')
        expect(res.statusCode).toBe(404)
        // Agrega más expectativas para verificar la respuesta
    });

    afterEach(() => {
        mongoose.connection.close();
        server.close();
    })
});
