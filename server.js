require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const mainRouter = require("./router/main/main_api");
const getKeysRouter = require("./router/main/get_keys_api");

const detailRouter = require("./router/detail/detail_api");
const reserveRouter = require("./router/detail/reserve_api");

const myHouseRouter = require("./router/host/my-house/my_house_api");
const deleteRouter = require("./router/host/my-house/delete_api");
const modifyRouter = require("./router/host/my-house/modify_api");

const registerRouter = require("./router/host/register/register_api");

const passwordRouter = require("./router/host/reservation-status/password_api");
const reservationStatusRouter = require("./router/host/reservation-status/reservation_status_api");
const changePasswordRouter = require("./router/host/reservation-status/change_password_api");
const calculateRouter = require("./router/host/reservation-status/calculate_api");

const myReservationRouter = require("./router/my-reservation/my_reservation_api");
const cancelReservationRouter = require("./router/my-reservation/cancel_reservation_api");
const checkPasswordRouter = require("./router/my-reservation/check_password_api");
const getPasswordRouter = require("./router/my-reservation/get_password_api");
const updatePasswordcheckRouter = require("./router/my-reservation/update_passwordcheck_api");

const app = express();

app.use(express.static(path.join(__dirname, "/client/build")));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/main", mainRouter);
app.use("/get_keys", getKeysRouter);

app.use("/detail", detailRouter);
app.use("/reserve", reserveRouter);

app.use("/host/my-house", myHouseRouter);
app.use("/host/my-house/modify", modifyRouter);
app.use("/host/my-house/delete", deleteRouter);

app.use("/host/register", registerRouter);

app.use("/host/reservation-status", reservationStatusRouter);
app.use("/host/reservation-status/password", passwordRouter);
app.use("/host/reservation-status/change_password", changePasswordRouter);
app.use("/host/reservation-status/calculate", calculateRouter);

app.use("/my-reservation", myReservationRouter);
app.use("/my-reservation/cancel", cancelReservationRouter);
app.use("/my-reservation/check_password", checkPasswordRouter);
app.use("/my-reservation/get_password", getPasswordRouter);
app.use("/my-reservation/update_passwordcheck", updatePasswordcheckRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
