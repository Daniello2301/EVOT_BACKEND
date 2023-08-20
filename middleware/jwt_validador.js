const JWT = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const jwtValidador = (req, res, next) => {
    const token = req.header('Authorization');

    if(!token)
    {
        return res.status(400).send({msg:"Error, no autorizado"});
    }

    try {
        const payload = JWT.verify(token, `${process.env.SECRET_KEY_JWT}`)
        req.payload = payload;
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).send({msg:"Error interno del servidor"});
    }
}

module.exports = {jwtValidador}