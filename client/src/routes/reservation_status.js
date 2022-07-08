import { useState, useEffect } from "react";
import ReserveStatusCard from "./../components/ReserveStatusCard";
import { Heading, Grid } from "@chakra-ui/react";
import { axiosInstance } from "../config";

const ReservationStatus = ({ account }) => {
  const [reserveStatusArray, setReserveStatusArray] = useState([]);

  const getReserveStatus = () => {
    axiosInstance.get("/host/reservation-status", { params: { account: account } }).then((res) => {
      if (res.status === 200) {
        setReserveStatusArray(res.data.reserveStatusArray);
      } else {
        console.error(res.data);
      }
    });
  };

  useEffect(() => {
    getReserveStatus();
  }, [account]);

  return (
    <>
      <Heading size="2xl">예약 현황</Heading>
      <Grid templateColumns="repeat(4, 1fr)" gap="2vw" w="75vw" h="78vh" mt="1vw">
        {reserveStatusArray &&
          reserveStatusArray.map((v, i) => {
            return (
              <ReserveStatusCard
                key={i}
                owner_account={account}
                reservation_id={v.reservation_id}
                product_id={v.product_id}
                reservationMapping_id={v.reservationMapping_id}
                image={v.image}
                name={v.name}
                checkin={v.checkin}
                checkout={v.checkout}
                totalPrice={v.totalPrice}
                disabled={v.disabled}
                getReserveStatus={getReserveStatus}
              />
            );
          })}
      </Grid>
    </>
  );
};

export default ReservationStatus;
