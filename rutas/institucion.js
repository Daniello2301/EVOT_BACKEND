const { Router } = require('express');
const instituController = require('../controladores/insitucion')
const { jwtValidador, isAdmin } = require('../middleware/jwt_validador')
const { check } = require('express-validator')

const route = Router();

// Listar todas las intituciones
route.get('/institutions',
[
    jwtValidador,
    isAdmin
], 
instituController.getAll);


// Listar lasntituciones que tiene el usuario activo
route.get('/institutions/actives',
instituController.getWithActveUser);


// listar una institucion por Id
route.get('/institution/:id', 
[
    jwtValidador
],
instituController.getById);


// Crear Una Institucion
route.post('/institution/create', 
[
    jwtValidador,
    check('codigoInstitucion','El codigo de la instituciono es requerido').notEmpty(),
    check('nombreInstitucion', 'El nombre de la institucion es requerido').notEmpty(),
    check('ciudad', 'La ciudad es requerida').notEmpty(),
    check('departamento',  'El departamento es requerido').notEmpty(),
    check('resolucion', 'La resolucion de la insituciones requerido').notEmpty(),
    check('fechaResolucion','La fecha de la resolucion es requerida').notEmpty()
],
instituController.crear);


// Actualizar Institucion
route.put('/institution/update/:id', 
[
    jwtValidador,
],
instituController.actualizar);


// Deshabilitar in institucion
route.put('/institution/deactivate/:id', 
[
    jwtValidador,
    isAdmin
],
instituController.desahabilitar);


// Activar Institucion
route.put('/institution/activate/:id', 
[
    jwtValidador,
    isAdmin
],
instituController.activar);


module.exports = route;