import { Stack, Flex, Box, Text } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

function Layout({ account, children }) {
  const navigate = useNavigate();

  const str1 = account.substring(0, 5);
  const str2 = account.slice(-3);
  const account_str = str1 + "..." + str2;

  return (
    <Stack h="100vh" id="main">
      <Flex bg="pink.50" pr="30vh" pl="30vh" justify="space-between" alignItems="center" h="15vh">
        <Box
          onClick={() => {
            navigate("/");
          }}
          cursor="pointer"
        >
          <Text fontWeight="bold" fontSize="5xl" color="#cc5de8">
            AirWithBlock
          </Text>
        </Box>
        <Flex>
          <Text fontWeight="bold" fontSize="3xl" mr="3vw" color="#495057">
            account : ${account_str}
          </Text>
          <Link to="/host">
            <Text fontWeight="bold" fontSize="3xl" mr="3vw" color="#495057">
              호스트 되기
            </Text>
          </Link>
          <Link to="/my-reservation">
            <Text fontWeight="bold" fontSize="3xl" color="#495057">
              나의 예약
            </Text>
          </Link>
        </Flex>
      </Flex>
      <Flex direction="column" h="full" justifyContent="center" alignItems="center">
        {children}
      </Flex>
    </Stack>
  );
}

export default Layout;
