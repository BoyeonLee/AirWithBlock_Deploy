const express = require("express");
const router = express.Router();
const con = require("../../../modules/mysql");
const fs = require("fs");

const multer = require("multer");

router.get("/:product_id", async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const account = req.query.account;

    const sql = `SELECT * FROM Products WHERE id = ${product_id}`;
    con.query(sql, (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        if (rows[0].owner_account.toString() !== account) {
          res.status(403).status({ message: "owner_account가 일치하지 않습니다." });
        } else {
          const data = fs.readFileSync(rows[0].product_image);
          const b64 = data.toString("base64");
          const imgFile = `data:image/jpeg;base64,${b64}`;

          res.status(200).send({ image: imgFile, productInfoArray: rows[0] });
        }
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "mainImage/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "." + file.mimetype.substring(6));
  },
});

const upload = multer({ storage: imageStorage, limits: { fileSize: 20 * 1024 * 1024 } });

router.put("/:product_id", upload.single("file"), async (req, res) => {
  try {
    const product_id = req.params.product_id;

    if (req.body.file === "") {
      const sql = `UPDATE Products SET product_name = ?, product_type = ?, product_contents = ?, people_number=?, postal_code = ?, basic_addr=?, detailed_addr=?, price=? WHERE id = ${parseInt(
        product_id
      )}`;
      const params = [
        req.body.name,
        req.body.type,
        req.body.contents,
        req.body.person,
        req.body.postcode,
        req.body.basic_addr,
        req.body.detailed_addr,
        req.body.price,
      ];
      con.query(sql, params, (err, rows, fields) => {
        if (err) {
          res.status(500).send({ message: err });
        } else {
          res.status(200).send({ message: "수정 완료!", product_id: product_id });
        }
      });
    } else {
      const sql = `UPDATE Products SET product_image = ?, product_name = ?, product_type = ?, product_contents = ?, people_number=?, postal_code = ?, basic_addr=?, detailed_addr=?, price=? WHERE id = ${parseInt(
        product_id
      )}`;
      const params = [
        req.file.path,
        req.body.name,
        req.body.type,
        req.body.contents,
        req.body.person,
        req.body.postcode,
        req.body.basic_addr,
        req.body.detailed_addr,
        req.body.price,
      ];
      con.query(sql, params, (err, rows, fields) => {
        if (err) {
          res.status(500).send({ message: err });
        } else {
          res.status(200).send({ message: "수정 완료!", product_id: product_id });
        }
      });
    }
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
