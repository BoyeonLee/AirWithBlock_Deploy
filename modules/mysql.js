const mysql = require("mysql");

const host = process.env.HEROKU_HOST;
const user = process.env.HEROKU_USER;
const password = process.env.HEROKU_PASSWORD;
const database = process.env.HEROKU_DATABASE;

const con = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
  multipleStatements: true,
});

module.exports = con;
