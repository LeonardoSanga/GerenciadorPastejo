const mdlPastos = require("../model/mdlPastos");

const GetAllPastos = (req, res) => (async () => {
    let registro = await mdlPastos.GetAllPastos();

    res.json({ status: "ok", "registro": registro });
})();

const GetPastoByID = (req, res) => (async () => {
    const pastoID = parseInt(req.params.pastoid);
    let registro = await mdlPastos.GetPastoByID(pastoID);
    res.json({ status: "ok", "registro": registro });
})();

const InsertPasto = (request, res) => (async () => {
    const pastoREG = request.body;
    let { msg, linhasAfetadas } = await mdlPastos.InsertPasto(pastoREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const UpdatePasto = (request, res) => (async () => {
    const pastoID = parseInt(request.params.pastoid);
    const pastoREG = request.body;
    let { msg, linhasAfetadas } = await mdlPastos.UpdatePasto(pastoID, pastoREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const DeletePasto = (request, res) => (async () => {
    const pastoID = parseInt(request.params.pastoid);
    let { msg, linhasAfetadas } = await mdlPastos.DeletePasto(pastoID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

module.exports = {
    GetAllPastos,
    GetPastoByID,
    InsertPasto,
    UpdatePasto,
    DeletePasto,
};
