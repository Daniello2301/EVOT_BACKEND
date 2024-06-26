const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

/**
 * Establishes a connection to MongoDB based on the environment.
 */
const conexion = async () => {
    // Determine which MongoDB URI to use based on the environment
    const { MONGO_URI, MONGO_URI_TEST, NODE_ENV } = process.env;
    const URI = NODE_ENV === 'test' ? MONGO_URI_TEST : MONGO_URI;

    console.log('Connecting to MongoDB...');
    try {
        // Connect to MongoDB using Mongoose
        await mongoose.connect(URI);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
    }
}

module.exports = conexion;