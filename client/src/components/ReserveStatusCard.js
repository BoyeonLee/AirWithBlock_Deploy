import { useState, useEffect } from "react";
import {
  Heading,
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  CloseButton,
  Tooltip,
} from "@chakra-ui/react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { axiosInstance } from "../config";

import Caver from "caver-js";
import { contractABI, contractAddress } from "./../contract/transferContract";

const ReserveStatusCard = ({
  owner_account,
  reservation_id,
  product_id,
  reservationMapping_id,
  image,
  name,
  checkin,
  checkout,
  totalPrice,
  disabled,
  getReserveStatus,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [disabledState, setDisabledState] = useState(disabled);
  const [changeDisabled, setChangeDisabled] = useState(false);
  const [heading, setHeading] = useState("");
  const [changeLabel, setChangeLabel] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculateDisabled, setCalculateDisabled] = useState(false);

  const caver = new Caver(window.klaytn);
  const contract = caver.contract.create(contractABI, contractAddress);

  const modalStyle = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.45)",
      zIndex: 10,
    },
    content: {
      width: "30vw",
      height: "35vh",
      textAlign: "center",
      background: "#f8f0fc",
      overflow: "auto",
      margin: "auto",
      WebkitOverflowScrolling: "touch",
      borderRadius: "14px",
      outline: "none",
      zIndex: 10,
      paddingTop: "5vh",
    },
  };

  const getDate = (date) => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    const dateString = year + "/" + month + "/" + day;
    return dateString;
  };

  const checkCalculate = () => {
    if (new Date(getDate(new Date())) > new Date(checkin)) {
      axiosInstance
        .get("/host/reservation-status/calculate", {
          params: { reservation_id: reservation_id },
        })
        .then((res) => {
          if (res.status === 200) {
            setIsCalculated(res.data.calculate);
          } else {
            console.error(res.data);
          }
        });
    }
  };

  const transferToMe = () => {
    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: window.klaytn.selectedAddress,
        to: contractAddress,
        data: contract.methods
          .transferToOwnerByOwner(reservationMapping_id, window.klaytn.selectedAddress)
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
              Swal.fire({ icon: "success", title: "?????? ?????????????????????.", width: 600 }).then(() => {
                setCalculateDisabled(true);
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
  };

  const checkPassword = async () => {
    if (password1 !== password2) {
      Swal.fire({ icon: "error", title: "??????????????? ???????????? ????????????.", width: 600 }).then(() => {
        setPassword1("");
        setPassword2("");
      });
      return;
    } else {
      const data = {
        product_id: product_id,
        reservation_id: reservation_id,
        owner_account: owner_account,
        password: password1,
      };

      await axiosInstance({
        method: "POST",
        url: "/host/reservation-status/password",
        data: data,
      }).then((res) => {
        if (res.status === 200) {
          Swal.fire({ icon: "success", title: res.data.message, width: 600 }).then(() => {
            setModalIsOpen(false);
            setDisabledState(true);
            checkChange();
          });
        } else {
          console.error(res.data);
        }
      });
    }
  };

  const changePassword = async () => {
    if (password1 !== password2) {
      Swal.fire({ icon: "error", title: "??????????????? ???????????? ????????????.", width: 600 }).then(() => {
        setPassword1("");
        setPassword2("");
      });
      return;
    } else {
      const data = {
        product_id: product_id,
        reservation_id: reservation_id,
        owner_account: owner_account,
        password: password1,
      };

      await axiosInstance({
        method: "PUT",
        url: "/host/reservation-status/change_password",
        data: data,
      }).then((res) => {
        if (res.status === 200) {
          Swal.fire({ icon: "success", title: res.data.message, width: 600 }).then(() => {
            setModalIsOpen(false);
            setDisabledState(true);
          });
        } else {
          console.error(res.data);
        }
      });
    }
  };

  const checkChange = () => {
    if (disabledState === false) {
      setChangeDisabled(true);
      setChangeLabel("??????????????? ???????????? ????????? ??? ????????????.");
    } else if (new Date() > new Date(checkin)) {
      setChangeDisabled(true);
      setChangeLabel("????????? ???????????? ??????????????? ????????? ??? ????????????.");
    }
  };

  useEffect(() => {
    checkChange();
    checkCalculate();
  }, []);

  return (
    <Box w="17vw" h="40vh" bg="pink.50">
      <Link to={`/detail/${product_id}`}>
        <Flex w="14vw" h="18vh" m="1.5vw auto 0 auto" justify="center">
          <img src={image} alt="main_image"></img>
        </Flex>
      </Link>
      <Box textAlign="center" mt="0.5vw">
        <Text fontSize="2xl" mb="0.5vw">
          {name}
        </Text>
        <Text fontSize="xl" mb="0.2vw">
          ?????? ?????? : {checkin} ~ {checkout}
        </Text>
        <Text fontSize="xl" mb="0.5vw">
          ??? ?????? : {totalPrice} KLAY
        </Text>
        <Flex justify="center">
          {isCalculated === true ? (
            <Tooltip
              hasArrow
              label="???????????? ?????? ????????? ????????? ?????? ????????? ??? ????????????."
              isDisabled={!calculateDisabled}
            >
              <Button
                colorScheme="purple"
                size="lg"
                onClick={transferToMe}
                disabled={calculateDisabled}
              >
                ????????????
              </Button>
            </Tooltip>
          ) : (
            <>
              <Button
                disabled={disabledState}
                colorScheme="purple"
                size="md"
                mr="1vw"
                onClick={() => {
                  setModalIsOpen(true);
                  setHeading("???????????? ??????");
                }}
              >
                ???????????? ??????
              </Button>
              <Tooltip
                hasArrow
                label={changeLabel}
                shouldWrapChildren
                mt="3"
                isDisabled={!changeDisabled}
              >
                <Button
                  disabled={changeDisabled}
                  colorScheme="blue"
                  size="md"
                  onClick={() => {
                    setModalIsOpen(true);
                    setHeading("???????????? ??????");
                  }}
                >
                  ???????????? ??????
                </Button>
              </Tooltip>
            </>
          )}
        </Flex>
        <Modal isOpen={modalIsOpen} style={modalStyle}>
          <CloseButton
            size="lg"
            position="fixed"
            right="36vw"
            top="17vw"
            onClick={() => setModalIsOpen(false)}
          />
          <Heading size="xl">{heading}</Heading>
          <Box m="1.5vw auto auto 2vh">
            <FormControl isRequired>
              <Flex mb="1vw">
                <FormLabel w="8vw" fontSize="xl" ml="1vh">
                  ????????????
                </FormLabel>
                <Input
                  size="md"
                  type="password"
                  w="16vw"
                  value={password1}
                  onChange={(e) => {
                    setPassword1(e.target.value);
                  }}
                />
              </Flex>
            </FormControl>
            <FormControl isRequired>
              <Flex mb="1vw">
                <FormLabel w="8vw" fontSize="xl" ml="1vh">
                  ???????????? ?????????
                </FormLabel>
                <Input
                  size="md"
                  type="password"
                  w="16vw"
                  value={password2}
                  onChange={(e) => {
                    setPassword2(e.target.value);
                  }}
                />
              </Flex>
            </FormControl>
            {heading === "???????????? ??????" ? (
              <Button
                colorScheme="purple"
                size="lg"
                display="block"
                m="2vw auto auto auto"
                onClick={checkPassword}
              >
                ???????????? ??????
              </Button>
            ) : (
              <Button
                colorScheme="purple"
                size="lg"
                display="block"
                m="2vw auto auto auto"
                onClick={changePassword}
              >
                ???????????? ??????
              </Button>
            )}
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default ReserveStatusCard;
