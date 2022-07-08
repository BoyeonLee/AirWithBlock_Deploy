const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const con = require("../../../modules/mysql");

router.post("/", async (req, res) => {
  try {
    const product_id = req.body.product_id;
    const reservation_id = req.body.reservation_id;
    const owner_account = req.body.owner_account;
    const password = req.body.password;

    const check_sql = `SELECT * FROM Password WHERE product_id=${product_id} AND reservation_id=${reservation_id}`;
    con.query(check_sql, (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        if (rows[0] !== undefined) {
          res.status(200).send({ alert_message: "비밀번호를 이미 등록했습니다." });
          return;
        }
      }
    });

    const join_sql = `SELECT r.id, r.owner_account, r.buyer_account, u.public_key, u.private_key FROM Reservation AS r INNER JOIN Users AS u ON r.buyer_account = u.account WHERE r.id = ${reservation_id}`;
    con.query(join_sql, (join_err, join_rows, fields) => {
      if (join_err) {
        res.status(500).send({ message: join_err });
      } else {
        if (join_rows[0].owner_account.toString() !== owner_account) {
          res.status(403).send({ message: "집 주인만 비밀번호를 등록할 수 있습니다." });
        } else {
          const enc = crypto.publicEncrypt(join_rows[0].public_key, Buffer.from(password));
          const encstr = enc.toString("base64");

          const sql = `INSERT INTO Password (product_id, reservation_id, password) VALUES (?,?,?)`;
          const params = [product_id, reservation_id, encstr];
          con.query(sql, params, (err, rows, fields) => {
            if (err) {
              res.status(500).send({ message: err });
            } else {
              console.log("비밀번호 등록 완료");
              res.status(200).send({ message: "비밀번호 등록 완료" });
            }
          });
        }
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
