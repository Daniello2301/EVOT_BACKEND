const { Router } = require('express');
const controladorGraduados = require('../controladores/graduado');

const router = Router();

// listar todo y por Id
router.get('/graduados', controladorGraduados.getGraduados);
router.get('/graduado/:id', controladorGraduados.getById);


// crear graduado
router.post('/create/graduado', controladorGraduados.createGraduado);

// actualizar graduado
router.put('/update/graduado/:id', controladorGraduados.updateGraduado);

// Borrar gradudo
router.delete('/delete/graduado/:id', controladorGraduados.deleteGraduado);

module.exports = router;