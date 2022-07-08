const express = require("express");
const router = express.Router();
const fs = require("fs");
const con = require("../../modules/mysql");

const getDate = (date) => {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  const dateString = year + "/" + month + "/" + day;
  return dateString;
};

router.get("/", async (req, res) => {
  try {
    const account = req.query.account;
    const reservationArray = [];

    const sql = `SELECT r.id, r.product_id, r.reservationMapping_id, p.product_image, p.product_name, r.checkin, r.checkout, r.password_check FROM Reservation AS r INNER JOIN Products AS p ON r.product_id = p.id WHERE r.buyer_account = '${account}'`;
    con.query(sql, (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        if (rows.length === 0) {
          res.status(200).send({ reservationArray: [] });
          return;
        }
        for (let i = 0; i < rows.length; i++) {
          const data = fs.readFileSync(rows[i].product_image);
          const b64 = data.toString("base64");
          const imgFile = `data:image/jpeg;base64,${b64}`;

          const result = {
            reservation_id: rows[i].id,
            product_id: rows[i].product_id,
            reservationMapping_id: rows[i].reservationMapping_id,
            image: imgFile,
            name: rows[i].product_name,
            checkin: getDate(rows[i].checkin),
            checkout: getDate(rows[i].checkout),
            password_check: rows[i].password_check,
          };
          reservationArray.push(result);
          if (i === rows.length - 1) {
            reservationArray.sort(function (a, b) {
              return new Date(a.checkin) - new Date(b.checkin);
            });
            res.status(200).send({ reservationArray: reservationArray });
          }
        }
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
    return;
  }
});

module.exports = router;
