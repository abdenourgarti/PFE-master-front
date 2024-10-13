// context/AuthContext.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserInfo } from "@/store/features/auth/authSlice";
import { setOrganization } from "@/store/features/organization/organizationSlice";
// Assuming you have a userSlice.js file
import { auth } from "../firebase/config";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      await setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    // <<<<<<< HEAD
    // const dispatch = useDispatch();
    // try {
    //   setLoading(true);
    //   await signInWithEmailAndPassword(auth, email, password);
    //   console.log("signed is");
    //   console.log(email);
    //   const axiosInstance = axios.create({
    //     baseURL: "https://pfe-master-backend.vercel.app",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    // =======
    try {
      setLoading(true);
      console.log("oneeeee");
      await signInWithEmailAndPassword(auth, email, password);
      console.log("signed in");

      const axiosInstance = axios.create({
        baseURL: "https://pfe-master-backend.vercel.app",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await axiosInstance.get("/user/me", {
        params: { email: email },
      });

      let user = response.data;
      await localStorage.setItem("userInfo", JSON.stringify(user));
      dispatch(setUserInfo(user));

      // Check user role
      const userRole = user.roles[0]?.role; // Assuming the first role is the primary role

      // Store userRole in localStorage
      localStorage.setItem("userRole", userRole);

      if (userRole === "orgBoss") {
        const orgResponse = await axiosInstance.get(
          "/organization/organizations",
          {
            params: { Boss: user._id },
            // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
          }
        );

        if (orgResponse.data[0]) {
          dispatch(setOrganization(orgResponse.data[0]));
          await localStorage.setItem(
            "organization",
            JSON.stringify(orgResponse.data[0])
          );
        }

        router.push(`/${locale}/Employee/BoardEmployee`);
      } else if (userRole === "individual") {
        router.push(`/${locale}/Employee/BoardEmployee`);
      } else {
        // For other roles (employee, teamBoss, prjctBoss)
        if (user.roles[0]?.organization) {
          const orgResponse = await axiosInstance.get(
            "/organization/organizations",
            {
              params: { _id: user.roles[0].organization._id },
            }
          );

          if (orgResponse.data[0]) {
            dispatch(setOrganization(orgResponse.data[0]));
            await localStorage.setItem(
              "organization",
              JSON.stringify(orgResponse.data[0])
            );
          }
        }

        router.push(`/${locale}/Employee/BoardEmployee`);
      }

      sessionStorage.setItem("user", "true");
      localStorage.setItem("user", "true");
    } catch (error) {
      console.error("Error logging in:", error);
      // Handle error (e.g., show error message to the user)
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    await signOut(auth);
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("organization");
    localStorage.removeItem("userRole");

    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
