const { Router } = require('express');
const diplomaControlador = require('../controladores/diploma');
const { jwtValidador, isAdmin } = require('../middleware/jwt_validador');
const { check } = require('express-validator')

const route = Router();

// Listar todos los diplomas
route.get('/diplomas',
[
    jwtValidador,
    isAdmin
],
diplomaControlador.listarTodos);


// Listar diploma por Id
route.get('/diploma/:id',
diplomaControlador.listarPorId);


// Buscar por cedula de graduado
route.get('/diplomas/by/graduate/:cedula',
diplomaControlador.listarPorGraduado);


// Listar pot institucion logeada
route.get('/diplomas/by/insititution',
[
    jwtValidador
]
,diplomaControlador.listarPorInstitucion);


// Crear diploma
route.post('/diploma/create',
[
    jwtValidador,
    check('codigoDiploma',' El codigo del diploma es requerido').notEmpty(),
    check('nombrePrograma',' El nombre del diploma es requerido').notEmpty(),
    check('nivelPrograma',' El nivel del diploma es requerido').notEmpty(),
    check('registroPrograma',' El codigo del diploma es requerido').notEmpty(),
    check('libro',' El libro es requerido').notEmpty(),
    check('fechaGrados','La fecha del diploma es requerido').notEmpty(),
    check('cedula', 'la cedula del esudiante es requerida').notEmpty()
]
,diplomaControlador.crear);


// Actualizar diploma solo administradores
route.put('/diploma/update/:id',
[
    jwtValidador,
    isAdmin
]
,diplomaControlador.actualizar);


// Eliminar diploma, solo administrador
route.delete('/diploma/delete/:id',
[
    jwtValidador,
    isAdmin
]
,diplomaControlador.eliminar);

module.exports = route;

