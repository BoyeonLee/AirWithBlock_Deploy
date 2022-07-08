import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Input, Button } from "@chakra-ui/react";
import Swal from "sweetalert2";
import Location from "./../components/Location";
import { axiosInstance } from "../config";

import Caver from "caver-js";
import { contractABI, contractAddress } from "./../contract/transferContract";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./../css/datepicker.css";
import ko from "date-fns/locale/ko";
registerLocale("ko", ko);

const Detail = ({ account }) => {
  const navigate = useNavigate();

  const product_id = useParams().product_id;
  const [ownerAccount, setOwnerAccount] = useState("");
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [image, setImage] = useState();
  const [name, setName] = useState("");
  const [contents, setContents] = useState("");
  const [type, setType] = useState("");
  const [person, setPerson] = useState();
  const [postCode, setPostCode] = useState();
  const [basicAddr, setBasicAddr] = useState("");
  const [detailAddr, setDetailAddr] = useState("");
  const [price, setPrice] = useState();
  const [totalPrice, setTotalPrice] = useState();
  const [reservationDay, setReservationDay] = useState();
  const [checkInArray, setCheckInArray] = useState([]);
  const [checkOutArray, setCheckOutArray] = useState([]);

  const getProductDetail = async () => {
    await axiosInstance({
      method: "GET",
      url: `/detail/${product_id}`,
    }).then((res) => {
      if (res.status === 200) {
        setImage(res.data.infoArray[0].image);
        setOwnerAccount(res.data.infoArray[0].info.owner_account);
        setName(res.data.infoArray[0].info.product_name);
        setContents(res.data.infoArray[0].info.product_contents);
        setPerson(res.data.infoArray[0].info.people_number);
        setPostCode(res.data.infoArray[0].info.postal_code);
        setBasicAddr(res.data.infoArray[0].info.basic_addr);
        setDetailAddr(res.data.infoArray[0].info.detailed_addr);
        setPrice(res.data.infoArray[0].info.price);
        setCheckInArray(res.data.checkInArray);
        setCheckOutArray(res.data.checkOutArray);

        const product_type = res.data.infoArray[0].info.product_type;
        if (product_type === "apt") {
          setType("아파트");
        } else if (product_type === "officetel") {
          setType("오피스텔");
        } else if (product_type === "house") {
          setType("주택");
        } else if (product_type === "etc") {
          setType("기타");
        }

        let today_string = getDate(new Date());
        let today = new Date();
        if (res.data.checkInArray !== []) {
          for (let i = 0; i < res.data.checkInArray.length; i++) {
            if (res.data.checkInArray[i] === today_string) {
              today = new Date(today.setDate(today.getDate() + 1));
              today_string = getDate(today);
            }
          }
          const tomorrow = new Date(today.setDate(today.getDate() + 1));
          setCheckIn(new Date(today_string));
          setCheckOut(new Date(getDate(tomorrow)));
        }
      } else {
        console.error(res.data);
      }
    });
  };

  const getDate = (date) => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    const dateString = year + "-" + month + "-" + day;
    return dateString;
  };

  const checkTotalPrice = () => {
    const check_in = new Date(getDate(checkIn));
    const check_out = new Date(getDate(checkOut));
    if (check_in >= check_out) {
      Swal.fire({ icon: "error", title: "체크아웃 날짜를 다시 설정해주십시오.", width: 600 });
      return;
    }
    const difference = Math.abs(check_out - check_in);
    const days = difference / (1000 * 3600 * 24);
    setReservationDay(days);
    setTotalPrice(days * price);
  };

  const makeReservation = async () => {
    const s = String.fromCharCode.apply(null, ownerAccount.data);
    const owner_account = decodeURIComponent(s);

    const checkIn_date = new Date(getDate(checkIn)).getTime() / 100000;

    const caver = new Caver(window.klaytn);
    const contract = caver.contract.create(contractABI, contractAddress);

    const caver_event = new Caver("https://api.baobab.klaytn.net:8651/");
    const contract_event = new caver_event.klay.Contract(contractABI, contractAddress);

    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: window.klaytn.selectedAddress,
        to: contractAddress,
        data: contract.methods
          .transferToContract(owner_account, parseInt(product_id), checkIn_date)
          .encodeABI(),
        value: caver.utils.toPeb(totalPrice, "KLAY"),
        gas: 8000000,
      })
      .on("receipt", async (receipt) => {
        if (receipt.status) {
          const fromBlock = receipt.blockNumber - 1;
          const event = await contract_event.getPastEvents("TransferToContract", {
            filter: { owner: owner_account, product_id: parseInt(product_id), date: checkIn_date },
            fromBlock,
          });
          const reservationMappingId = parseInt(event[0].returnValues.reservationId);

          const data = {
            product_id: parseInt(product_id),
            owner_account: owner_account,
            buyer_account: account,
            reservation_id: reservationMappingId,
            check_in: getDate(checkIn),
            check_out: getDate(checkOut),
            reservation_day: reservationDay,
          };

          await axiosInstance({
            method: "POST",
            url: "/reserve",
            data: data,
          }).then((res) => {
            if (res.status === 200) {
              Swal.fire({ icon: "success", title: res.data.message, width: 600 }).then(() => {
                navigate("/my-reservation");
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

  useEffect(() => {
    getProductDetail();
  }, []);

  return (
    <Box w="50vw" h="80vh" borderWidth="8px" borderColor="pink.50" borderRadius="1vw">
      <Flex mt="2vw" justify="center">
        <Box w="20vw" h="25vh" textAlign="center" mr="2vw">
          <img src={image} alt="main_image"></img>
        </Box>
        <Box>
          <Flex>
            <Text fontSize="2xl" mr="1vw" mb="1vw">
              집 제목
            </Text>
            <Box
              w="16vw"
              h="4vh"
              borderWidth="4px"
              borderColor="BlackAlpha.50"
              borderRadius="1vh"
              textAlign="center"
            >
              <Text fontSize="2xl">{name}</Text>
            </Box>
          </Flex>
          <Flex>
            <Text fontSize="2xl" mr="1vw">
              집 설명
            </Text>
            <Box
              w="16vw"
              h="8vh"
              borderWidth="4px"
              borderColor="BlackAlpha.50"
              borderRadius="1vh"
              textAlign="center"
              mb="1vw"
            >
              <Text fontSize="2xl">{contents}</Text>
            </Box>
          </Flex>
          <Flex>
            <Text fontSize="2xl" mr="1vw" mb="1vw">
              집 유형
            </Text>
            <Box
              w="16vw"
              h="4vh"
              borderWidth="4px"
              borderColor="BlackAlpha.50"
              borderRadius="1vh"
              textAlign="center"
            >
              <Text fontSize="2xl">{type}</Text>
            </Box>
          </Flex>
          <Flex>
            <Text fontSize="2xl" mr="1vw" mb="1vw">
              최대 가능 인원
            </Text>
            <Box
              w="16vw"
              h="4vh"
              borderWidth="4px"
              borderColor="BlackAlpha.50"
              borderRadius="1vh"
              textAlign="center"
            >
              <Text fontSize="2xl">{person} 명</Text>
            </Box>
          </Flex>
        </Box>
      </Flex>
      <Box mt="1vw" ml="3vw">
        <Flex>
          <Text fontSize="2xl" mr="1vw">
            집 주소
          </Text>
          <Box
            w="24vw"
            h="7vh"
            borderWidth="4px"
            borderColor="BlackAlpha.50"
            borderRadius="1vh"
            textAlign="center"
            mr="1vw"
          >
            <Text fontSize="xl">
              ({postCode}) {basicAddr} {detailAddr}
            </Text>
          </Box>
          <Text fontSize="2xl" mr="1vw" mb="1vw">
            가격
          </Text>
          <Box
            w="10vw"
            h="4vh"
            borderWidth="4px"
            borderColor="BlackAlpha.50"
            borderRadius="1vh"
            textAlign="center"
          >
            <Text fontSize="2xl">{price} KLAY / 1박</Text>
          </Box>
        </Flex>
      </Box>
      <Flex justify="center" mt="1vw">
        <Location basicAddr={basicAddr} />
        <Box ml="3vw">
          <Flex mb="1vh">
            <Box w="6vw" h="4vh">
              <Text fontSize="2xl">체크인</Text>
            </Box>
            <DatePicker
              className="outline"
              locale="ko"
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
              }}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn}
              dateFormat="yyyy-MM-dd"
              excludeDates={checkInArray.map((date) => new Date(date))}
            />
          </Flex>
          <Flex mb="1vw">
            <Box w="8vw" h="4vh">
              <Text fontSize="2xl">체크아웃</Text>
            </Box>
            <DatePicker
              className="outline"
              locale="ko"
              selected={checkOut}
              onChange={(date) => {
                setCheckOut(date);
              }}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkOut}
              dateFormat="yyyy-MM-dd"
              excludeDates={checkOutArray.map((date) => new Date(date))}
            />
          </Flex>
          <Box textAlign="center">
            <Button colorScheme="pink" size="md" onClick={checkTotalPrice}>
              총 가격
            </Button>
          </Box>
          <Flex mt="2vw" mb="1vw">
            <Text fontSize="3xl" mr="1vw">
              총 가격
            </Text>
            <Box
              w="8vw"
              h="5vh"
              borderWidth="4px"
              borderColor="BlackAlpha.50"
              borderRadius="1vh"
              textAlign="center"
            >
              <Text fontSize="3xl">{totalPrice} KLAY</Text>
            </Box>
          </Flex>
          <Box textAlign="center">
            <Button colorScheme="purple" size="lg" onClick={makeReservation}>
              예약하기
            </Button>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Detail;
