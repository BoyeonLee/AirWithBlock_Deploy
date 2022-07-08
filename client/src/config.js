import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://airwithblock.herokuapp.com",
});
