const db = require("../../../database/databaseconfig");

const GetAllAlocados = async () => {
    return (
        await db.query(
            "SELECT *, (SELECT nome from animal where animalid = alocado.animalidfk) as animalnome, " +
            "(SELECT descricao from piquete where piqueteid = alocado.piqueteidfk) as piquetedescricao " +
            "FROM alocado WHERE removido = false ORDER BY datainicio ASC"
        )
    ).rows;
};

const GetAlocadoByID = async (alocadoIDPar) => {
    return (
        await db.query(
            "SELECT *, (SELECT nome from animal where animalid = alocado.animalidfk) as animalnome, " +
            "(SELECT descricao from piquete where piqueteid = alocado.piqueteidfk) as piquetedescricao " +
            "FROM alocado WHERE alocadoid = $1 and removido = false ORDER BY datainicio ASC",
            [alocadoIDPar]
        )
    ).rows;
};

const InsertAlocado = async (alocadoREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "INSERT INTO alocado " + "values(default, $1, $2, $3, $4, $5)",
                [
                    alocadoREGPar.animalidfk,
                    alocadoREGPar.piqueteidfk,
                    alocadoREGPar.datainicio,
                    alocadoREGPar.datafinal || null,
                    alocadoREGPar.removido,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlAlocados|InsertAlocado] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const UpdateAlocado = async (alocadoIDPar, alocadoREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE alocado SET " +
                "animalidfk = $2, " +
                "piqueteidfk = $3, " +
                "datainicio = $4, " +
                "datafinal = $5, " +
                "removido = $6 " +
                "WHERE alocadoid = $1",
                [
                    alocadoIDPar,
                    alocadoREGPar.animalidfk,
                    alocadoREGPar.piqueteidfk,
                    alocadoREGPar.datainicio,
                    alocadoREGPar.datafinal || null,
                    alocadoREGPar.removido,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlAlocados|UpdateAlocado] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const DeleteAlocado = async (alocadoIDPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE alocado SET " + "removido = true " + "WHERE alocadoid = $1",
                [alocadoIDPar]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlAlocados|DeleteAlocado] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const GetAnimaisToAlocados = async () => {
    return (await db.query("select animalid, nome from animal where not removido = true order by nome")).rows;
};

const GetPiquetesToAlocados = async () => {
    return (
        await db.query(
            "select piqueteid, descricao, (SELECT descricao from pasto where pastoid = piquete.pastoidfk) as pastodescricao " +
            "from piquete where not removido = true order by descricao"
        )
    ).rows;
};


module.exports = {
    GetAllAlocados,
    GetAlocadoByID,
    InsertAlocado,
    UpdateAlocado,
    DeleteAlocado,
    GetAnimaisToAlocados,
    GetPiquetesToAlocados,
};
