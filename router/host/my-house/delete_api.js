const express = require("express");
const router = express.Router();
const con = require("../../../modules/mysql");
const getDate = require("../../../modules/getDate");

router.delete("/:product_id", async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const account = req.body.account;

    const join_sql = `SELECT p.id, p.owner_account, r.checkout FROM Products AS p INNER JOIN Reservation AS r ON p.id = r.product_id WHERE p.id = ${product_id}`;
    con.query(join_sql, (join_err, join_rows, fields) => {
      if (join_err) {
        res.status(500).send({ message: join_err });
      } else {
        if (join_rows.length === 0) {
          const sql1 = "SET foreign_key_checks = 0; ";
          const sql2 = `DELETE FROM Products WHERE id = ${product_id}; `;
          const sql3 = "SET foreign_key_checks = 1; ";
          con.query(sql1 + sql2 + sql3, (err, rows, fields) => {
            if (err) {
              res.status(500).send({ message: err });
            } else {
              res.status(200).send({ message: "삭제 완료!" });
            }
          });
          return;
        }
        for (let i = 0; i < join_rows.length; i++) {
          if (join_rows[i].owner_account.toString() !== account) {
            res.status(403).send({ message: "집 주인이 아니면 삭제할 수 없습니다." });
            return;
          } else {
            const checkout_date = getDate(join_rows[i].checkout);
            const today_date = getDate(new Date());
            if (new Date(checkout_date) < new Date(today_date)) {
              const sql1 = "SET foreign_key_checks = 0; ";
              const sql2 = `DELETE FROM Products WHERE id = ${product_id}; `;
              const sql3 = "SET foreign_key_checks = 1; ";
              con.query(sql1 + sql2 + sql3, (err, rows, fields) => {
                if (err) {
                  res.status(500).send({ message: err });
                } else {
                  res.status(200).send({ message: "삭제 완료!" });
                }
              });
            } else {
              res.status(200).send({ unable_message: "예약이 있어 삭제할 수 없습니다." });
              return;
            }
          }
        }
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});
module.exports = router;
