const mdlAnimais = require("../model/mdlAnimais");

const GetAllAnimais = (req, res) => (async () => {
    let registro = await mdlAnimais.GetAllAnimais();

    for (let i = 0; i < registro.length; i++) {
        const row = registro[i]; // Current row

        if (row.datanasc != null) {
            const formattedDateNasc = row.datanasc.toISOString().split('T')[0];
            row.datanasc = formattedDateNasc;
        }
    }

    res.json({ status: "ok", "registro": registro });
})();

const GetAnimalByID = (req, res) => (async () => {
    const animalID = parseInt(req.params.animalid);
    let registro = await mdlAnimais.GetAnimalByID(animalID);
    registro = registro[0];

    if (registro != null && registro.datanasc != null) {
        const formattedDateNasc = registro.datanasc.toISOString().split('T')[0];
        registro.datanasc = formattedDateNasc;
    }

    res.json({ status: "ok", "registro": registro });
})();

const InsertAnimal = (request, res) => (async () => {
    const animalREG = request.body;
    let { msg, linhasAfetadas } = await mdlAnimais.InsertAnimal(animalREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const UpdateAnimal = (request, res) => (async () => {
    const animalID = parseInt(request.params.animalid);
    const animalREG = request.body;
    let { msg, linhasAfetadas } = await mdlAnimais.UpdateAnimal(animalID, animalREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const DeleteAnimal = (request, res) => (async () => {
    const animalID = parseInt(request.params.animalid);
    let { msg, linhasAfetadas } = await mdlAnimais.DeleteAnimal(animalID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

module.exports = {
    GetAllAnimais,
    GetAnimalByID,
    InsertAnimal,
    UpdateAnimal,
    DeleteAnimal,
};
