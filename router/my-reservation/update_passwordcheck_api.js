const express = require("express");
const router = express.Router();
const con = require("../../modules/mysql");

router.put("/", async (req, res) => {
  try {
    const reservation_id = req.body.reservation_id;
    const password_check = req.body.password_check;

    const sql = `UPDATE Reservation SET password_check = ${password_check} WHERE id = ${reservation_id}`;
    con.query(sql, async (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        res.status(200).send({ message: "password_check update 완료" });
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
