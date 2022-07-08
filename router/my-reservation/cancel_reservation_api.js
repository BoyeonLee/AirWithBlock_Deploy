const express = require("express");
const router = express.Router();
const fs = require("fs");
const con = require("../../modules/mysql");

router.delete("/:reservation_id", async (req, res) => {
  try {
    const reservation_id = req.params.reservation_id;
    const buyer_account = req.body.account;

    const res_sql = `SELECT * FROM Reservation WHERE id = ${reservation_id}`;
    con.query(res_sql, (res_err, res_rows, fields) => {
      if (res_err) {
        res.status(500).send({ message: res_err });
        return;
      } else {
        if (res_rows[0].buyer_account.toString() !== buyer_account) {
          res.status(403).send({ message: "예약자만이 취소할 수 있습니다." });
          return;
        } else {
          const sql1 = "SET foreign_key_checks = 0; ";
          const sql2 = `DELETE FROM Reservation WHERE id = ${reservation_id}; `;
          const sql3 = "SET foreign_key_checks = 1; ";
          con.query(sql1 + sql2 + sql3, (err, rows, fields) => {
            if (err) {
              res.status(500).send({ message: err });
            } else {
              res.status(200).send({ message: "예약 취소 완료!" });
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
