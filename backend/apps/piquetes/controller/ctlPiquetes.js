const mdlPiquetes = require("../model/mdlPiquetes");

const GetAllPiquetes = (req, res) => (async () => {
    let registro = await mdlPiquetes.GetAllPiquetes();

    res.json({ status: "ok", "registro": registro });
})();

const GetPiqueteByID = (req, res) => (async () => {
    const piqueteID = parseInt(req.params.piqueteid);
    let registro = await mdlPiquetes.GetPiqueteByID(piqueteID);
    res.json({ status: "ok", "registro": registro });
})();

const InsertPiquete = (request, res) => (async () => {
    const piqueteREG = request.body;
    let { msg, linhasAfetadas } = await mdlPiquetes.InsertPiquete(piqueteREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const UpdatePiquete = (request, res) => (async () => {
    const piqueteID = parseInt(request.params.piqueteid);
    const piqueteREG = request.body;
    let { msg, linhasAfetadas } = await mdlPiquetes.UpdatePiquete(piqueteID, piqueteREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const DeletePiquete = (request, res) => (async () => {
    const piqueteID = parseInt(request.params.piqueteid);
    let { msg, linhasAfetadas } = await mdlPiquetes.DeletePiquete(piqueteID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const GetPastosToPiquetes = (req, res) => (async () => {
    let registro = await mdlPiquetes.GetPastosToPiquetes();
    res.json({ status: "ok", "registro": registro });
})();

module.exports = {
    GetAllPiquetes,
    GetPiqueteByID,
    InsertPiquete,
    UpdatePiquete,
    DeletePiquete,
    GetPastosToPiquetes
};
