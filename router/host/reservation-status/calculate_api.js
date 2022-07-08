const express = require("express");
const router = express.Router();
const con = require("../../../modules/mysql");

router.get("/", async (req, res) => {
  try {
    const reservation_id = req.query.reservation_id;

    const sql = `SELECT r.password_check From Reservation AS r INNER JOIN Password AS p ON r.id = p.reservation_id WHERE r.id = ${reservation_id}`;
    con.query(sql, (err, rows, fields) => {
      if (rows.length === 0) {
        res.status(200).send({ calculate: false });
      } else if (rows[0].password_check === 0) {
        res.status(200).send({ calculate: true });
      } else {
        res.status(200).send({ calculate: false });
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
