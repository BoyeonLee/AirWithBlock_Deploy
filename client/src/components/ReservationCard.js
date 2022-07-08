import { useState, useEffect } from "react";
import { Box, Flex, Text, Button, Tooltip } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { axiosInstance } from "../config";
import axios from "axios";

import Caver from "caver-js";
import { contractABI, contractAddress } from "./../contract/transferContract";

import qs from "qs";
axios.default.paramsSerializer = (params) => {
  return qs.stringify(params);
};

const ReservationCard = ({
  account,
  reservation_id,
  product_id,
  reservationMapping_id,
  image,
  name,
  checkin,
  checkout,
  password_check,
  getReservation,
}) => {
  const [isPast, setIsPast] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [cancelDisabled, setCancelDisabled] = useState(false);

  const caver = new Caver(window.klaytn);
  const contract = caver.contract.create(contractABI, contractAddress);

  const checkPast = () => {
    const today = new Date();
    const checkout_day = new Date(checkout);
    if (today > checkout_day) {
      setIsPast(true);
    }
  };

  const getDate = (date) => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    const dateString = year + "/" + month + "/" + day;
    return dateString;
  };

  const isToday = () => {
    const today = getDate(new Date());
    if (today === checkin) {
      setDisabled(false);
      setCancelDisabled(true);
    }
  };

  const getPasswordFromServer = async () => {
    const data = {
      account: account,
      product_id: product_id,
      reservation_id: reservation_id,
    };

    axiosInstance.get("/my-reservation/get_password", { params: { data: data } }).then((res) => {
      if (res.status === 200) {
        Swal.fire({ icon: "success", title: `비밀번호 : ${res.data.password}`, width: 600 });
      } else {
        console.error(res.data);
      }
    });
  };

  const getPassword = async () => {
    axiosInstance
      .get("/my-reservation/check_password", {
        params: { reservation_id: reservation_id, product_id: product_id },
      })
      .then((res) => {
        if (res.status === 200) {
          if (res.data.message) {
            Swal.fire({ icon: "error", title: res.data.message, width: 600 });
            return;
          }
          if (password_check === 0) {
            caver.klay
              .sendTransaction({
                type: "SMART_CONTRACT_EXECUTION",
                from: window.klaytn.selectedAddress,
                to: contractAddress,
                data: contract.methods
                  .transferToOwner(reservationMapping_id, window.klaytn.selectedAddress)
                  .encodeABI(),
                gas: 8000000,
              })
              .on("receipt", async (receipt) => {
                if (receipt.status) {
                  await axiosInstance({
                    method: "PUT",
                    url: "/my-reservation/update_passwordcheck",
                    data: { reservation_id: reservation_id, password_check: 1 },
                  }).then((res) => {
                    if (res.status === 200) {
                      getReservation();
                      getPasswordFromServer();
                    } else {
                      console.error(res.data);
                    }
                  });
                }
              })
              .on("error", (e) => {
                console.log(e);
              });
          } else {
            getPasswordFromServer();
          }
        } else {
          console.error(res.data);
        }
      });
  };

  const getDateDiff = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);

    const diffDate = date1.getTime() - date2.getTime();

    return Math.abs(diffDate / (1000 * 60 * 60 * 24));
  };

  const cancelToContract = (percent) => {
    Swal.fire({
      icon: "info",
      title: "예약 취소",
      html: `지금 예약을 취소하시면 <b>${percent}% 환불</b> 받으실 수 있습니다.<br>취소하시겠습니까?`,
      showCloseButton: true,
      width: 600,
    }).then(() => {
      caver.klay
        .sendTransaction({
          type: "SMART_CONTRACT_EXECUTION",
          from: window.klaytn.selectedAddress,
          to: contractAddress,
          data: contract.methods
            .cancelReservation(reservationMapping_id, window.klaytn.selectedAddress, percent)
            .encodeABI(),
          gas: 8000000,
        })
        .on("receipt", (receipt) => {
          if (receipt.status) {
            axiosInstance
              .delete(`/my-reservation/cancel/${reservation_id}`, {
                data: { account: account },
              })
              .then((res) => {
                if (res.status === 200) {
                  Swal.fire({ icon: "success", title: res.data.message, width: 600 }).then(() => {
                    getReservation();
                  });
                } else {
                  console.error(res.data);
                }
              });
          }
        })
        .on("error", (e) => {
          console.log(e);
        });
    });
  };

  const cancelReservation = () => {
    const dayDiff = getDateDiff(getDate(new Date()), checkin);
    if (dayDiff > 7) {
      cancelToContract(100);
    } else if (dayDiff > 3) {
      cancelToContract(50);
    } else {
      cancelToContract(30);
    }
  };

  useEffect(() => {
    checkPast();
  }, [isPast]);

  useEffect(() => {
    isToday();
  }, [disabled, cancelDisabled]);

  return (
    <Box w="17vw" h="40vh" bg="pink.50" opacity={isPast ? "0.6" : ""}>
      <Link to={`/detail/${product_id}`}>
        <Flex w="14vw" h="18vh" m="2vw auto 0 auto" justify="center">
          <img src={image} alt="main_image"></img>
        </Flex>
      </Link>
      <Box textAlign="center" mt="1vw">
        <Text fontSize="2xl" mb="0.5vw">
          {name}
        </Text>
        <Text fontSize="xl">
          예약 날짜 : {checkin} ~ {checkout}
        </Text>
        <Flex justify="center" mt="1vw">
          <Tooltip
            hasArrow
            label="체크인 하는 날에 비밀번호를 확인할 수 있습니다."
            shouldWrapChildren
            mt="3"
            isDisabled={!disabled}
          >
            <Button
              colorScheme="purple"
              size="md"
              display="block"
              mr="1vw"
              onClick={getPassword}
              disabled={disabled}
            >
              비밀번호 확인
            </Button>
          </Tooltip>
          <Tooltip
            hasArrow
            label="체크인 하는 날은 예약을 취소할 수 없습니다."
            shouldWrapChildren
            mt="3"
            isDisabled={!cancelDisabled}
          >
            <Button
              colorScheme="blue"
              size="md"
              display="block"
              onClick={cancelReservation}
              disabled={cancelDisabled}
            >
              예약 취소
            </Button>
          </Tooltip>
        </Flex>
      </Box>
    </Box>
  );
};

export default ReservationCard;
