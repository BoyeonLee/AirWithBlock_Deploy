import { useState } from "react";
import DaumPostCode from "react-daum-postcode";
import { Box, Flex, Input, Button, FormControl, FormLabel } from "@chakra-ui/react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Postcode = ({
  postcode,
  basicAddr,
  detailedAddr,
  setPostcode,
  setBasicAddr,
  setDetailedAddr,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const onClickOpenModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  const onCompletePost = (data) => {
    let fullAddr = data.address;
    let extraAddr = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddr += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddr += extraAddr !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddr += extraAddr !== "" ? ` (${extraAddr})` : "";
    }

    setPostcode(data.zonecode);
    setBasicAddr(fullAddr);
    setModalIsOpen(false);
  };

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
      width: "25vw",
      height: "55vh",
      display: "flex",
      justifyContent: "center",
      overflow: "auto",
      left: "38vw",
      right: "38vw",
      bottom: "42vh",
      WebkitOverflowScrolling: "touch",
      borderRadius: "14px",
      outline: "none",
      zIndex: 10,
    },
  };
  return (
    <Box w="75%" h="23vh" mt="1vw" p="1vw">
      <FormControl isRequired>
        <FormLabel fontSize="2xl" mb="1vh">
          집 주소
        </FormLabel>
        <Flex mb="0.5vw" w="50%">
          <Input size="md" mr="1vh" value={postcode} isRequired />
          <Button colorScheme="pink" size="md" onClick={onClickOpenModal}>
            우편번호
          </Button>
          {modalIsOpen && (
            <Modal
              isOpen={modalIsOpen}
              style={modalStyle}
              onRequestClose={() => {
                setModalIsOpen(false);
              }}
            >
              <DaumPostCode
                onComplete={onCompletePost}
                autoClose={true}
                style={{ width: "100%", height: "100%" }}
              />
            </Modal>
          )}
        </Flex>
        <Input size="md" placeholder="기본 주소" mb="0.5vw" value={basicAddr} isRequired />
        <Input
          size="md"
          placeholder="상세 주소"
          isRequired
          value={detailedAddr}
          onChange={(e) => {
            setDetailedAddr(e.target.value);
          }}
        />
      </FormControl>
    </Box>
  );
};

export default Postcode;
