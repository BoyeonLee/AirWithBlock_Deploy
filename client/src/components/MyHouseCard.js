import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { axiosInstance } from "../config";

const MyHouseCard = ({
  account,
  product_id,
  image,
  name,
  basic_addr,
  detailed_addr,
  getMyHouseArray,
}) => {
  const navigate = useNavigate();

  const deleteProduct = () => {
    axiosInstance
      .delete(`/host/my-house/delete/${product_id}`, {
        data: { account: account },
      })
      .then((res) => {
        if (res.status === 200) {
          if (res.data.message) {
            Swal.fire({ icon: "success", title: res.data.message, width: 600 }).then(() => {
              getMyHouseArray();
            });
          } else {
            Swal.fire({ icon: "error", title: res.data.unable_message, width: 600 });
          }
        } else {
          console.error(res.data);
        }
      });
  };
  return (
    <Box w="17vw" h="40vh" bg="pink.50">
      <Link to={`/detail/${product_id}`}>
        <Flex w="14vw" h="18vh" m="1vw auto 0 auto" justify="center">
          <img src={image} alt="main_image"></img>
        </Flex>
      </Link>
      <Box textAlign="center" mt="1vw">
        <Text fontSize="2xl" mb="0.5vw">
          {name}
        </Text>
        <Text fontSize="md" w="14vw" m="0 auto">
          {basic_addr}
          <br />
          {detailed_addr}
        </Text>
        <Flex justify="center" mt="1vh">
          <Button
            colorScheme="purple"
            size="md"
            display="block"
            mr="1vh"
            onClick={() => {
              navigate(`/host/modify/${product_id}`);
            }}
          >
            수정하기
          </Button>
          <Button colorScheme="blue" size="md" display="block" onClick={deleteProduct}>
            삭제하기
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default MyHouseCard;
