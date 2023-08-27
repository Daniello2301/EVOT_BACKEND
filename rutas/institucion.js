const { Router } = require('express');
const instituController = require('../controladores/insitucion')

const route = Router();

// Listar todas las intituciones
route.get('/intitutions', instituController.getAll);

// listar una institucion por Id
route.get('/intitution/:id', instituController.getById);

// Crear Una Institucion
route.post('/intitution/create', instituController.crear);

// Actualizar Institucion
route.put('/insitution/update/:id', instituController.actualizar);

module.exports = route;