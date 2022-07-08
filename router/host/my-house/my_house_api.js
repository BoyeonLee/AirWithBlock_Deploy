const express = require("express");
const router = express.Router();
const fs = require("fs");
const con = require("../../../modules/mysql");

router.get("/", async (req, res) => {
  try {
    const account = req.query.account;
    const myHouseArray = [];

    const sql = `SELECT * FROM Products WHERE owner_account = '${account}'`;
    con.query(sql, async (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        if (rows.length === 0) {
          res.status(200).send({ myHouseArray: [] });
          return;
        }
        for (let i = 0; i < rows.length; i++) {
          const product_id = rows[i].id;
          const data = fs.readFileSync(rows[i].product_image);
          const b64 = data.toString("base64");
          const imgFile = `data:image/jpeg;base64,${b64}`;
          const name = rows[i].product_name;
          const basic_addr = rows[i].basic_addr;
          const detailed_addr = rows[i].detailed_addr;

          const result = {
            product_id: product_id,
            image: imgFile,
            name: name,
            basic_addr: basic_addr,
            detailed_addr: detailed_addr,
          };
          myHouseArray.push(result);
        }
        res.status(200).send({ myHouseArray: myHouseArray });
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
    return;
  }
});

module.exports = router;
