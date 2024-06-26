const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const { MONGO_URI, MONGO_URI_TEST, NODE_ENV} = process.env

const URI = NODE_ENV === 'test' 
    ? MONGO_URI_TEST
    : MONGO_URI  

const conexion = async() => {

    console.log('conectando a mogodb...');
    try {        
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('conectado correctamente a mongodb');
    } catch (error) {
        console.log(error);
    }
}

module.exports = conexion;