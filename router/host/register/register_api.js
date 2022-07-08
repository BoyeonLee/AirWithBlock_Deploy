const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const con = require("../../../modules/mysql");

try {
  fs.readdirSync("mainImage");
} catch (err) {
  console.error("mainImage 폴더가 없습니다. 폴더를 생성합니다.");
  fs.mkdirSync("mainImage");
}

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "mainImage/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "." + file.mimetype.substring(6));
  },
});

const upload = multer({ storage: imageStorage, limits: { fileSize: 20 * 1024 * 1024 } });

const getDateTime = (today) => {
  let year = today.getFullYear();
  let month = ("0" + (today.getMonth() + 1)).slice(-2);
  let day = ("0" + today.getDate()).slice(-2);
  let dateString = year + "-" + month + "-" + day;

  let hours = ("0" + today.getHours()).slice(-2);
  let minutes = ("0" + today.getMinutes()).slice(-2);
  let seconds = ("0" + today.getSeconds()).slice(-2);
  let timeString = hours + ":" + minutes + ":" + seconds;

  return dateString + " " + timeString;
};

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const now = new Date();

    const sql =
      "INSERT INTO Products (owner_account, product_type, product_name, product_contents, product_image, people_number, postal_code, basic_addr, detailed_addr, price, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    const params = [
      req.body["owner_account"],
      req.body["type"],
      req.body["name"],
      req.body["contents"],
      req.file.path,
      req.body["person"],
      req.body["postcode"],
      req.body["basic_addr"],
      req.body["detailed_addr"],
      req.body["price"],
      getDateTime(now),
    ];

    con.query(sql, params, (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
      } else {
        res.status(200).send({ message: "집 등록완료", product_id: rows.insertId });
        console.log("success");
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
