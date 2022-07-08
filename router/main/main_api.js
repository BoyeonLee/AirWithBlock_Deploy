const express = require("express");
const router = express.Router();
const fs = require("fs");
const con = require("../../modules/mysql");

router.get("/", async (req, res) => {
  try {
    const sql = "SELECT * FROM Products";
    con.query(sql, (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        const infoArray = [];
        for (var i = 0; i < rows.length; i++) {
          const data = fs.readFileSync(rows[i].product_image);
          const b64 = data.toString("base64");
          const imgFile = `data:image/jpeg;base64,${b64}`;

          const info = {
            id: rows[i].id,
            image: imgFile,
            name: rows[i].product_name,
            price: rows[i].price,
          };
          infoArray.push(info);
        }
        res.status(200).send({ infoArray: infoArray });
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
