const { Router } = require('express');
const instituController = require('../controladores/insitucion')

const route = Router();

// Listar todas las intituciones
route.get('/institutions', instituController.getAll);

// Listar lasntituciones que tiene el usuario activo
route.get('/institutions/actives', instituController.getWithActveUser);

// listar una institucion por Id
route.get('/institution/:id', instituController.getById);

// Crear Una Institucion
route.post('/institution/create', instituController.crear);

// Actualizar Institucion
route.put('/institution/update/:id', instituController.actualizar);

// Deshabilitar in institucion
route.put('/institution/deactivate/:id', instituController.desahabilitar);

// Activar Institucion
route.put('/institution/activate/:id', instituController.activar);


module.exports = route;