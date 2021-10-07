const sqlConfig = require("./DBConfig");
const sql = require("mssql");

const query = async function(_query, parameters= {}){
    const connectionPool = await sql.connect(sqlConfig);
    let result = await sql.query(_query);
    sql.query
    await connectionPool.close();
    return result;
    
};

module.exports = {
    query: query
};