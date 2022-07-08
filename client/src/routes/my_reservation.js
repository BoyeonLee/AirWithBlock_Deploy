import { useState, useEffect } from "react";
import { Grid, Heading } from "@chakra-ui/react";
import ReservationCard from "./../components/ReservationCard";
import { axiosInstance } from "../config";

const MyReservation = ({ account }) => {
  const [reservationArray, setReservationArray] = useState([]);
  const getReservation = () => {
    axiosInstance.get("/my-reservation", { params: { account: account } }).then((res) => {
      if (res.status === 200) {
        setReservationArray(res.data.reservationArray);
      } else {
        console.error(res.data);
      }
    });
  };

  useEffect(() => {
    getReservation();
  }, [account]);

  return (
    <>
      <Heading size="2xl">나의 예약</Heading>
      <Grid templateColumns="repeat(4, 1fr)" gap="2vw" w="75vw" h="75vh" mt="1vw">
        {reservationArray &&
          reservationArray.map((v, i) => {
            return (
              <ReservationCard
                key={i}
                account={account}
                reservation_id={v.reservation_id}
                product_id={v.product_id}
                reservationMapping_id={v.reservationMapping_id}
                image={v.image}
                name={v.name}
                checkin={v.checkin}
                checkout={v.checkout}
                password_check={v.password_check}
                getReservation={getReservation}
              />
            );
          })}
      </Grid>
    </>
  );
};

export default MyReservation;
