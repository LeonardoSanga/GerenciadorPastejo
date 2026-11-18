const db = require("../../../database/databaseconfig");

const GetAllAnimais = async () => {
    return (
        await db.query(
            "SELECT * " +
            "FROM animal WHERE removido = false ORDER BY nome ASC"
        )
    ).rows;
};

const GetAnimalByID = async (animalIDPar) => {
    return (
        await db.query(
            "SELECT * " +
            "FROM animal WHERE animalid = $1 and removido = false ORDER BY nome ASC",
            [animalIDPar]
        )
    ).rows;
};

const InsertAnimal = async (animalREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "INSERT INTO animal " + "values(default, $1, $2, $3)",
                [
                    animalREGPar.nome,
                    animalREGPar.datanasc,
                    animalREGPar.removido,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlAnimais|InsertAnimal] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const UpdateAnimal = async (animalIDPar, animalREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE animal SET " +
                "nome = $2, " +
                "datanasc = $3, " +
                "removido = $4 " +
                "WHERE animalid = $1",
                [
                    animalIDPar,
                    animalREGPar.nome,
                    animalREGPar.datanasc,
                    animalREGPar.removido,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlAnimais|UpdateAnimal] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const DeleteAnimal = async (animalIDPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE animal SET " + "removido = true " + "WHERE animalid = $1",
                [animalIDPar]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlAnimais|DeleteAnimal] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

module.exports = {
    GetAllAnimais,
    GetAnimalByID,
    InsertAnimal,
    UpdateAnimal,
    DeleteAnimal,
};
