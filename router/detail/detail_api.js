const express = require("express");
const router = express.Router();
const fs = require("fs");
const getDate = require("../../modules/getDate");
const con = require("../../modules/mysql");

router.get("/:product_id", async (req, res) => {
  try {
    const id = req.params.product_id;
    const sql1 = `SELECT * FROM Products WHERE id = ${id}; `;
    const sql2 = `SELECT * FROM Reservation WHERE product_id = ${id}; `;

    con.query(sql1 + sql2, (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        const infoArray = [];
        const checkInArray = [];
        const checkOutArray = [];

        const data = fs.readFileSync(rows[0][0].product_image);
        const b64 = data.toString("base64");
        const imgFile = `data:image/jpeg;base64,${b64}`;

        infoArray.push({ image: imgFile, info: rows[0][0] });

        for (let i = 0; i < rows[1].length; i++) {
          const checkin_day = new Date(getDate(rows[1][i].checkin));
          const checkout_day = new Date(getDate(rows[1][i].checkout));
          const difference = Math.abs(checkout_day - checkin_day);
          const days = difference / (1000 * 3600 * 24);

          if (days === 1) {
            checkInArray.push(getDate(rows[1][i].checkin));
          } else {
            for (let j = 0; j < days; j++) {
              const checkin_date = new Date(checkin_day.setDate(checkin_day.getDate() + j));
              checkInArray.push(getDate(checkin_date));
            }
          }
          checkOutArray.push(getDate(rows[1][i].checkout));
        }

        res.status(200).send({
          infoArray: infoArray,
          checkInArray: checkInArray,
          checkOutArray: checkOutArray,
        });
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
