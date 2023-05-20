const Graduado = require('../modelos/Graduado');

const getGraduados = async(req, res) => {
    try {
        
        const graduados = await Graduado.find();
        if(graduados.length > 0){
            res.status(200).json(graduados);
        }else{
            res.status(404).json({ msg: "No informacion disponible"});
        }

    } catch (error) {
        res.statu(500).send(error);
    }
}


module.exports ={
    getGraduados
}