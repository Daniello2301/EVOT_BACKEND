const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const methodoverride = require('method-override');
const session = require('express-session')

/// inicializamos la aplicacion por express
const app = express();

// importar la conexion a la base de datos
const conexion = require('./db/conexionDB');
// Ejecutamos la conexion a la base de datos
conexion();

// Seteamos la configuracion del express-session
app.use(session({
    secret: 'evot-project IEPRAV',
    resave: true,
    saveUninitialized: true
}))

// Definimos middlewares
app.use(cors());
app.use(express.json());
app.use(methodoverride());
app.use(bodyparser.urlencoded({ extended: true }));

// definimos puertos
const PORT = process.env.PORT || 5000;

// asiganammos a la ruta raiz un mensaje
app.get('/', (req, res) => {
    res.send('API  funcional!');
});

// importamos las rutas
const graduado = require('./rutas/graduados');
const usuario = require('./rutas/usuario')
const institucion = require('./rutas/institucion')

// asiganammos a las rutas
app.use('/api', graduado);
app.use('/api', usuario);
app.use('/api', institucion);

// levantamos la aplicación por el puerto definido
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});


module.exports = app;
