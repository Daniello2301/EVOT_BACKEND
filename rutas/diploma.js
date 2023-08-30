const { Router } = require('express');
const diplomaControlador = require('../controladores/diploma');

const route = Router();

route.get('/diplomas',diplomaControlador.listarTodos);

route.get('/diploma/:id',diplomaControlador.listarPorId);

route.get('/diplomas/by/graduate',diplomaControlador.listarPorGraduado);

route.get('/diplomas/by/insititution',diplomaControlador.listarPorInstitucion);


route.post('/diploma/create',diplomaControlador.crear);


route.put('/diploma/update/:id',diplomaControlador.actualizar);


route.delete('/diploma/delete/:id',diplomaControlador.eliminar);

module.exports = route;

