import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Input,
  Textarea,
  Select,
  InputGroup,
  InputRightAddon,
  Button,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import Postcode from "./../components/Postcode";
import { axiosInstance } from "../config";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

const Register = ({ account }) => {
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState("");
  const imgRef = useRef();

  const [imageFile, setImageFile] = useState("");
  const [name, setName] = useState("");
  const [contents, setContents] = useState("");
  const [type, setType] = useState("");
  const [person, setPerson] = useState();
  const [postcode, setPostcode] = useState();
  const [basicAddr, setBasicAddr] = useState("");
  const [detailedAddr, setDetailedAddr] = useState("");
  const [price, setPrice] = useState();

  const onChangeImage = (fileBlob) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileBlob);
    return new Promise((resolve) => {
      reader.onload = () => {
        setImageUrl(reader.result);
        resolve();
      };
    });
  };

  const onResizeImage = async (image) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 500,
    };

    try {
      const compressedFile = await imageCompression(image, options);
      setImageFile(compressedFile);
    } catch (error) {
      console.log(error);
    }
  };

  const onClickFileBtn = (e) => {
    imgRef.current.click();
  };

  const onRegister = async (e) => {
    e.preventDefault();
    if (imageFile === "") {
      Swal.fire({ icon: "error", title: "메인 이미지가 등록되지 않았습니다.", width: 600 });
      return;
    }
    const formData = new FormData();

    formData.append("file", imageFile);

    formData.append("owner_account", account);
    formData.append("name", name);
    formData.append("contents", contents);
    formData.append("type", type);
    formData.append("person", person);
    formData.append("postcode", postcode);
    formData.append("basic_addr", basicAddr);
    formData.append("detailed_addr", detailedAddr);
    formData.append("price", price);

    await axiosInstance({
      method: "POST",
      url: "/host/register",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => {
      if (res.status === 200) {
        const id = res.data.product_id;
        Swal.fire({ icon: "success", title: res.data.message, width: 600 }).then(() => {
          navigate(`/detail/${id}`);
        });
      } else {
        console.error(res.data);
      }
    });
  };

  return (
    <Box w="45vw" h="80vh" p="1vw" borderWidth="8px" borderColor="pink.50" borderRadius="1vw">
      <Box textAlign="center">
        <Text fontSize="4xl">집 등록하기</Text>
      </Box>
      <form onSubmit={onRegister}>
        <Flex justify="space-evenly" alignItems="center" mt="1vw">
          <Box>
            <button
              onClick={() => {
                onClickFileBtn();
              }}
            >
              <Box w="20vw" h="25vh" textAlign="center">
                <img src={imageUrl ? imageUrl : "/img/default_img.png"} alt="main_image"></img>
              </Box>
              <Input
                type="file"
                ref={imgRef}
                name="image"
                onChange={(e) => {
                  onChangeImage(e.target.files[0]);
                  onResizeImage(e.target.files[0]);
                }}
                style={{ display: "none" }}
              ></Input>
            </button>
          </Box>
          <Box textAlign="center">
            <FormControl isRequired>
              <Flex mb="1vh">
                <FormLabel w="7vw" fontSize="2xl" ml="1vh">
                  집 제목
                </FormLabel>
                <Input
                  size="md"
                  type="text"
                  defaultValue={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </Flex>
            </FormControl>
            <FormControl isRequired>
              <Flex mb="1vh">
                <FormLabel w="7vw" fontSize="2xl" ml="1vh">
                  집 소개
                </FormLabel>
                <Textarea
                  defaultValue={contents}
                  onChange={(e) => {
                    setContents(e.target.value);
                  }}
                />
              </Flex>
            </FormControl>
            <FormControl isRequired>
              <Flex mb="1vh">
                <FormLabel w="7vw" fontSize="2xl" ml="1vh">
                  집 유형
                </FormLabel>
                <Select
                  placeholder="집 유형"
                  size="md"
                  onChange={(e) => {
                    setType(e.target.value);
                  }}
                >
                  <option value="apt">아파트</option>
                  <option value="officetel">오피스텔</option>
                  <option value="house">주택</option>
                  <option value="etc">기타</option>
                </Select>
              </Flex>
            </FormControl>
            <FormControl isRequired>
              <Flex>
                <FormLabel w="9vw" fontSize="2xl" ml="1vh">
                  가능 인원
                </FormLabel>
                <Input
                  isRequired
                  size="md"
                  type="number"
                  defaultValue={person}
                  onChange={(e) => {
                    setPerson(e.target.value);
                  }}
                />
              </Flex>
            </FormControl>
          </Box>
        </Flex>
        <Postcode
          postcode={postcode}
          basicAddr={basicAddr}
          detailedAddr={detailedAddr}
          setPostcode={setPostcode}
          setBasicAddr={setBasicAddr}
          setDetailedAddr={setDetailedAddr}
        ></Postcode>
        <FormControl isRequired>
          <Flex justify="center" mb="2vw" mt="1vw">
            <FormLabel fontSize="2xl" mr="1vw">
              가격(1박)
            </FormLabel>
            <InputGroup size="md" w="8vw">
              <Input
                isRequired
                type="number"
                defaultValue={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
              <InputRightAddon children="KLAY" />
            </InputGroup>
          </Flex>
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg" display="block" m="auto">
          등록하기
        </Button>
      </form>
    </Box>
  );
};

export default Register;
