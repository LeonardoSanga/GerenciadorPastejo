const db = require("../../../database/databaseconfig");

const GetAllPastos = async () => {
    return (
        await db.query(
            "SELECT * " +
            "FROM pasto WHERE removido = false ORDER BY descricao ASC"
        )
    ).rows;
};

const GetPastoByID = async (pastoIDPar) => {
    return (
        await db.query(
            "SELECT * " +
            "FROM pasto WHERE pastoid = $1 and removido = false ORDER BY descricao ASC",
            [pastoIDPar]
        )
    ).rows;
};

const InsertPasto = async (pastoREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "INSERT INTO pasto " + "values(default, $1, $2, $3)",
                [
                    pastoREGPar.descricao,
                    pastoREGPar.areatotal,
                    pastoREGPar.removido,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlPastos|InsertPasto] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const UpdatePasto = async (pastoIDPar, pastoREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE pasto SET " +
                "descricao = $2, " +
                "areatotal = $3, " +
                "removido = $4 " +
                "WHERE pastoid = $1",
                [
                    pastoIDPar,
                    pastoREGPar.descricao,
                    pastoREGPar.areatotal,
                    pastoREGPar.removido,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlPastos|UpdatePasto] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const DeletePasto = async (pastoIDPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE pasto SET " + "removido = true " + "WHERE pastoid = $1",
                [pastoIDPar]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlPastos|DeletePasto] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

module.exports = {
    GetAllPastos,
    GetPastoByID,
    InsertPasto,
    UpdatePasto,
    DeletePasto,
};
