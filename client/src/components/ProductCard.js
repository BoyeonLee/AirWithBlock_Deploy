import { Box, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const ProductCard = ({ id, mainImage, name, price }) => {
  return (
    <Box w="17vw" h="38vh" bg="pink.50">
      <Link to={`detail/${id}`}>
        <Flex w="14vw" h="18vh" m="2vw auto 0 auto" justify="center">
          <img src={mainImage} alt="main_image"></img>
        </Flex>
      </Link>
      <Box textAlign="center" mt="1vw">
        <Text fontSize="2xl" mb="0.5vw">
          {name}
        </Text>
        <Text fontSize="xl">{price} KLAY / 1박</Text>
      </Box>
    </Box>
  );
};

export default ProductCard;
