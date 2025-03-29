import {Sequelize} from "sequelize";

const db = new Sequelize('kos_db', 'root', '', {
    host: "localhost",
    dialect: "mysql"
});

export default db;