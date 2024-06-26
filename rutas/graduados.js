const { Router } = require('express');
const controladorGraduados = require('../controladores/graduado');
const { jwtValidador, isAdmin } = require('../middleware/jwt_validador')
const { check } = require('express-validator')

const router = Router();

// listar todo y por Id
router.get('/graduados', 
[
    jwtValidador,
    isAdmin
],
controladorGraduados.getGraduados);


// Listar graduado por Id
router.get('/graduado/:id',
[
    jwtValidador
], 
controladorGraduados.getById);


//Listar por isntitucion logueada
router.get('/graduados/institution', 
[
    jwtValidador
],
controladorGraduados.graduadosPorIddeInstitucion);


// crear graduado
router.post('/create/graduado', 
[
    jwtValidador,
    check('cedula','La cedula del estudiante es requerida').notEmpty(),
    check('NombreCompledo','El Nombre completo de estudiante es requerido').notEmpty(),
    check('fechaNacimiento', 'La fecha de nacimiento es requeria').notEmpty()
],
controladorGraduados.createGraduado);


// actualizar graduado
router.put('/update/graduado/:id',
[
    jwtValidador,
    isAdmin
], 
controladorGraduados.updateGraduado);


// Borrar gradudo
router.delete('/delete/graduado/:id',
[
    jwtValidador,
    isAdmin
], 
controladorGraduados.deleteGraduado);

module.exports = router;