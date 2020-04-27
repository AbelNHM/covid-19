import React, { useContext } from "react";
import axios from "axios";
import { getLocation } from "../lib/maps";

export const UserContext = React.createContext();

export const useUser = () => {
  const userState = useContext(UserContext);
  return userState.user;
};

export const useUserSetter = () => {
  const userState = useContext(UserContext);
  return userState.setUser;
};

export const useUserIsLoading = () => {
  const userState = useContext(UserContext);
  return userState.loading;
};

export const useUserLogout = () => {
  const userState = useContext(UserContext);
  return async () => {
    userState.setUser(null);
    return logout();
  };
};

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER,
  withCredentials: true
});

export const signup = async ({
  username,
  password,
  name,
  surname,
  email,
  profilePic
}) => {
  const location = await getLocation();
  await api.post("/auth/signup", {
    username,
    password,
    name,
    surname,
    email,
    location
  });
  return await upload(profilePic[0]);
};

export const upload = async file => {
  const data = new FormData();
  data.append("image", file);
  const res = await api.post("/profile/image", data);
  return res.data;
};

export const login = async ({ username, password }) => {
  const res = await api.post("/auth/login/", {
    username,
    password
  });
  return res.data;
};

export const logout = async () => {
  const res = await api.get("/auth/logout");
  return res.data;
};

export const loggedin = async () => {
  const res = await api.get("/auth/loggedin/");
  return res.data;
};
