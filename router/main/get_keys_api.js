const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const con = require("../../modules/mysql");

const passphrase = process.env.PASSPHRASE;

router.post("/", async (req, res) => {
  try {
    const account = req.body.account;

    const sql = `SELECT * FROM Users WHERE account = '${account}'`;
    con.query(sql, async (err, rows, fields) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      } else {
        if (rows.length !== 0) {
          res.status(200).send({ message: "이미 등록된 계정입니다." });
          console.log("이미 등록된 계정입니다.");
          return;
        } else {
          crypto.generateKeyPair(
            "rsa",
            {
              modulusLength: 4096,
              publicKeyEncoding: {
                type: "spki",
                format: "pem",
              },
              privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
                cipher: "aes-256-cbc",
                passphrase: passphrase,
              },
            },
            (err, publicKey, privateKey) => {
              const sql = "INSERT INTO Users (account, public_key, private_key) VALUES (?,?,?)";
              const params = [account.toString(), publicKey, privateKey];
              con.query(sql, params, async (err, rows, fields) => {
                if (err) {
                  res.status(500).send({ message: err });
                } else {
                  res.status(200).send({ message: "keys 저장 완료" });
                  console.log("keys 저장 완료");
                }
              });
            }
          );
        }
      }
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

module.exports = router;
