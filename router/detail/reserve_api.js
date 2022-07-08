const express = require("express");
const router = express.Router();
const con = require("../../modules/mysql");

router.post("/", async (req, res) => {
  try {
    const sql =
      "INSERT INTO Reservation (product_id, reservationMapping_id, owner_account, buyer_account, checkin, checkout, reservation_day) VALUES (?,?,?,?,?,?,?)";
    const params = [
      req.body.product_id,
      req.body.reservation_id,
      req.body.owner_account,
      req.body.buyer_account,
      req.body.check_in,
      req.body.check_out,
      req.body.reservation_day,
    ];

    con.query(sql, params, (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        res.status(200).send({ message: "예약 완료" });
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
