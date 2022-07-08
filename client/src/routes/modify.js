import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const Modify = ({ account }) => {
  const navigate = useNavigate();

  const product_id = useParams().product_id;
  const imgRef = useRef();

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [name, setName] = useState("");
  const [contents, setContents] = useState("");
  const [type, setType] = useState("");
  const [person, setPerson] = useState("");
  const [postcode, setPostcode] = useState("");
  const [basicAddr, setBasicAddr] = useState("");
  const [detailedAddr, setDetailedAddr] = useState("");
  const [price, setPrice] = useState("");

  const onClickFileBtn = (e) => {
    imgRef.current.click();
  };

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

  const getProductInfo = () => {
    axiosInstance
      .get(`/host/my-house/modify/${product_id}`, {
        params: { account: account },
      })
      .then((res) => {
        if (res.status === 200) {
          setImageUrl(res.data.image);
          setName(res.data.productInfoArray.product_name);
          setContents(res.data.productInfoArray.product_contents);

          setType(res.data.productInfoArray.product_type);
          setPerson(res.data.productInfoArray.people_number);
          setPostcode(res.data.productInfoArray.postal_code);
          setBasicAddr(res.data.productInfoArray.basic_addr);
          setDetailedAddr(res.data.productInfoArray.detailed_addr);
          setPrice(res.data.productInfoArray.price);
        } else {
          console.error(res.data);
        }
      });
  };

  const onModify = async (e) => {
    e.preventDefault();
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
      method: "PUT",
      url: `/host/my-house/modify/${product_id}`,
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

  const select_options = [
    { value: "apt", name: "아파트" },
    { value: "officetel", name: "오피스텔" },
    { value: "house", name: "주택" },
    { value: "etc", name: "기타" },
  ];

  useEffect(() => {
    getProductInfo();
  }, [account]);

  return (
    <Box w="42vw" h="80vh" p="1vw" borderWidth="8px" borderColor="pink.50" borderRadius="1vw">
      <Box textAlign="center">
        <Text fontSize="4xl">집 수정하기</Text>
      </Box>
      <Flex justify="space-evenly" alignItems="center" mt="1vw">
        <Box>
          <button
            onClick={() => {
              onClickFileBtn();
            }}
          >
            <Box w="20vw" h="25vh" textAlign="center">
              <img src={imageUrl} alt="main_image"></img>
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
                {select_options.map((option) => {
                  if (type === option.value) {
                    return (
                      <option key={option.value} value={option.value} selected>
                        {option.name}
                      </option>
                    );
                  } else {
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>;
                  }
                })}
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
      <Button
        type="submit"
        colorScheme="blue"
        size="lg"
        display="block"
        m="auto"
        onClick={onModify}
      >
        수정하기
      </Button>
    </Box>
  );
};

export default Modify;
