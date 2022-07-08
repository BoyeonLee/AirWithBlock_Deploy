const express = require("express");
const router = express.Router();
const fs = require("fs");
const con = require("../../../modules/mysql");

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

    const reserveStatusArray = [];

    const join_sql = `SELECT r.id, r.product_id, r.reservationMapping_id, p.product_image, p.product_name, r.checkin, r.checkout, p.price, r.reservation_day FROM Reservation AS r INNER JOIN Products AS p ON r.product_id = p.id WHERE p.owner_account = '${account}'`;
    con.query(join_sql, (join_err, join_rows, fields) => {
      if (join_err) {
        res.status(500).send({ message: join_err });
      } else {
        if (join_rows.length === 0) {
          res.status(200).send({ reserveStatusArray: [] });
          return;
        }
        for (let i = 0; i < join_rows.length; i++) {
          const data = fs.readFileSync(join_rows[i].product_image);
          const b64 = data.toString("base64");
          const imgFile = `data:image/jpeg;base64,${b64}`;

          const totalPrice = join_rows[i].price * join_rows[i].reservation_day;

          let disabled;

          const check_sql = `SELECT * FROM Password WHERE product_id=${join_rows[i].product_id} AND reservation_id=${join_rows[i].id}`;
          con.query(check_sql, async (err, rows, fields) => {
            if (err) {
              res.status(500).send({ message: err });
            } else {
              if (rows[0] !== undefined) {
                disabled = true;
              } else {
                disabled = false;
              }

              const result = {
                reservation_id: join_rows[i].id,
                product_id: join_rows[i].product_id,
                reservationMapping_id: join_rows[i].reservationMapping_id,
                image: imgFile,
                name: join_rows[i].product_name,
                checkin: getDate(join_rows[i].checkin),
                checkout: getDate(join_rows[i].checkout),
                totalPrice: totalPrice,
                disabled: disabled,
              };
              reserveStatusArray.push(result);
              if (i === join_rows.length - 1) {
                reserveStatusArray.sort(function (a, b) {
                  return new Date(a.checkin) - new Date(b.checkin);
                });
                res.status(200).send({ reserveStatusArray: reserveStatusArray });
              }
            }
          });
        }
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
    return;
  }
});

module.exports = router;
