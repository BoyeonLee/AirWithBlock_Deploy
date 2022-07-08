const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const con = require("../../modules/mysql");

router.get("/", async (req, res) => {
  try {
    const data = JSON.parse(req.query.data);
    const account = data.account;
    const product_id = data.product_id;
    const reservation_id = data.reservation_id;

    const pass_sql = `SELECT * FROM Password WHERE product_id = ${product_id} and reservation_id=${reservation_id}`;
    con.query(pass_sql, async (pass_err, pass_rows, fields) => {
      if (pass_err) {
        res.status(500).send({ message: pass_err });
      } else {
        const encrypted_password = pass_rows[0].password;

        const users_sql = `SELECT * FROM Users WHERE account = '${account}'`;
        con.query(users_sql, async (err, rows, fields) => {
          if (err) {
            res.status(400).send({ message: err });
          } else {
            const passphrase = process.env.PASSPHRASE;
            const privateKey = rows[0].private_key;

            const key = crypto.createPrivateKey({
              key: privateKey,
              format: "pem",
              passphrase: passphrase,
            });

            const dec = crypto.privateDecrypt(key, Buffer.from(encrypted_password, "base64"));
            const password = dec.toString("utf8");

            res.status(200).send({ password: password });
          }
        });
      }
    });
  } catch (err) {
    res.send({ success: fail, message: err });
  }
});

module.exports = router;
