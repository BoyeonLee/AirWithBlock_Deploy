const express = require("express");
const router = express.Router();
const con = require("../../modules/mysql");

router.get("/", async (req, res) => {
  const reservation_id = parseInt(req.query.reservation_id);
  const product_id = parseInt(req.query.product_id);

  const sql = `SELECT * FROM Password WHERE product_id=${product_id} and reservation_id=${reservation_id}`;
  con.query(sql, (err, rows, fields) => {
    if (err) {
      res.status(500).send({ message: err });
    } else {
      if (rows[0] === undefined) {
        res.status(200).send({ message: "비밀번호가 아직 등록되지 않았습니다." });
      } else {
        res.status(200).send();
      }
    }
  });
});

module.exports = router;
