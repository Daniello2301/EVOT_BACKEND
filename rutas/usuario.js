const { Router } = require('express');
const contrUsuario = require('../controladores/usuario');

const router = Router();

// listar todo y por Id
router.get('/users', contrUsuario.listarUsarios);
router.get('/user/:id', contrUsuario.listPorId);


// Login
router.post('/auth', contrUsuario.login);

// Registro
router.post('/auth/register', contrUsuario.register);


// deshabilidar usario
router.put('/deactivate/user/:id', contrUsuario.deshabilitarUsuario);

// Borrar gradudo
/* router.delete('/delete/graduado/:id', controladorGraduados.deleteGraduado); */

module.exports = router;