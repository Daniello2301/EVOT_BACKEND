const { Router } = require('express');
const controladorGraduados = require('../controladores/graduado');

const router = Router();

router.get('/graduados', controladorGraduados.getGraduados);



module.exports = router;