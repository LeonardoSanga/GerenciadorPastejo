const mdlAlocados = require("../model/mdlAlocados");

const GetAllAlocados = (req, res) => (async () => {
    let registro = await mdlAlocados.GetAllAlocados();

    for (let i = 0; i < registro.length; i++) {
        const row = registro[i]; // Current row

        if (row.datainicio != null) {
            const formattedDateInicio = row.datainicio.toISOString().split('T')[0];
            row.datainicio = formattedDateInicio;
        }

        if (row.datafinal != null) {
            const formattedDateFinal = row.datafinal.toISOString().split('T')[0];
            row.datafinal = formattedDateFinal;
        }
    }

    res.json({ status: "ok", "registro": registro });
})();

const GetAlocadoByID = (req, res) => (async () => {
    const alocadoID = parseInt(req.params.alocadoid);
    let registro = await mdlAlocados.GetAlocadoByID(alocadoID);
    registro = registro[0];

    if (registro != null && registro.datainicio != null) {
        const formattedDateInicio = registro.datainicio.toISOString().split('T')[0];
        registro.datainicio = formattedDateInicio;
    }

    if (registro != null && registro.datafinal != null) {
        const formattedDateFinal = registro.datafinal.toISOString().split('T')[0];
        registro.datafinal = formattedDateFinal;
    }

    res.json({ status: "ok", "registro": registro });
})();

const InsertAlocado = (request, res) => (async () => {
    const alocadoREG = request.body;
    let { msg, linhasAfetadas } = await mdlAlocados.InsertAlocado(alocadoREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const UpdateAlocado = (request, res) => (async () => {
    const alocadoID = parseInt(request.params.alocadoid);
    const alocadoREG = request.body;
    let { msg, linhasAfetadas } = await mdlAlocados.UpdateAlocado(alocadoID, alocadoREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const DeleteAlocado = (request, res) => (async () => {
    const alocadoID = parseInt(request.params.alocadoid);
    let { msg, linhasAfetadas } = await mdlAlocados.DeleteAlocado(alocadoID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const GetAnimaisToAlocados = (req, res) => (async () => {
    let registro = await mdlAlocados.GetAnimaisToAlocados();
    res.json({ status: "ok", "registro": registro });
})();

const GetPiquetesToAlocados = (req, res) => (async () => {
    let registro = await mdlAlocados.GetPiquetesToAlocados();
    res.json({ status: "ok", "registro": registro });
})();

module.exports = {
    GetAllAlocados,
    GetAlocadoByID,
    InsertAlocado,
    UpdateAlocado,
    DeleteAlocado,
    GetAnimaisToAlocados,
    GetPiquetesToAlocados
};
