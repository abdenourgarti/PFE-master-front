"use client";
import Link from "next/link";
import "./style.css";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { FaGoogle } from "react-icons/fa";
import { FaLocationArrow, FaCity } from "react-icons/fa";
import { IoEyeSharp, IoPersonSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import * as Yup from "yup";
import { createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import Select from "react-select";
import {
  MdAlternateEmail,
  MdBusinessCenter,
  MdOutlinePassword,
} from "react-icons/md";
import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import AccountTypeCard from "@/components/AccountTypeCard";
import { Formik } from "formik";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { setUserInfo } from "@/store/features/auth/authSlice";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";

const axiosInstance = axios.create({
  baseURL: "http://localhost:1937",
  headers: {
    "Content-Type": "application/json",
  },
});

const deleteUser = async (email) => {
  try {
    // <<<<<<< HEAD
    //     const axiosInstance = axios.create({
    //       baseURL: "http://localhost:1937",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     });
    // =======

    // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
    const response = await axiosInstance.delete(`/user/users?email=${email}`, {
      // Optional headers (e.g., authentication tokens)
    });

    if (response.status === 200) {
      console.log("User deleted successfully");
      // Handle successful deletion (e.g., update UI, redirect)
    } else {
      console.error("Error deleting user:", response.data.message);
      // Handle errors appropriately (e.g., display error message)
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    // Handle unexpected errors
  }
};

function Individuals() {
  const router = useRouter();

  const handleChangeGender = (selectedOption) => {
    formik.setFieldValue("gender", JSON.stringify(selectedOption));
  };
  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];
  const [view, setView] = useState(1);
  const t = useTranslations("Index");
  const locale = useLocale();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [value, setValue] = useState();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const [error, setErrorCred] = useState();
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    lastName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),

    gender: Yup.string().required("Required"),

    phoneNumber: Yup.string().required("Required"),

    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),
  });

  const handleDelete = async (email) => {
    console.log("email li raho yosel lahna");
    console.log(email);
    await deleteUser(email);
  };
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, actions) => {
      // <<<<<<< HEAD
      //       // alert(JSON.stringify(values, null, 2));
      //       // console.log(JSON.stringify(values, null, 2));
      //       // Create an instance of Axios with default headers
      //       const axiosInstance = axios.create({
      //         baseURL: "http://localhost:1937",
      //         headers: {
      //           "Content-Type": "application/json",
      //         },
      //       });

      // =======
      // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
      // Function to send the POST request
      const sendUserData = async (values) => {
        try {
          const response = await axiosInstance.post("/user/users", {
            nom: values.firstName,
            prenom: values.lastName,
            email: values.email,
            roles: [{ role: "individual", organization: null }],
            phoneNumber: values.phoneNumber,
            gender: values.gender,
            password: values.password,
          });
          console.log(response.data);
          let userInfo = response.data;
          // await localStorage.setItem("userInfo", JSON.stringify(response.data));
          // dispatch(setUserInfo(user));

          signUPFireBase(values, userInfo);
        } catch (error) {
          console.error("Error:", error?.response?.data?.error);
          setErrorCred({ userExist: error.response.data.error });
        }
      };
      const signUPFireBase = async (values, userInfo) => {
        try {
          createUserWithEmailAndPassword(auth, values.email, values.password)
            .then(async (res) => {
              console.log("sucess");
              localStorage.removeItem("organization");
              localStorage.removeItem("user");
              localStorage.removeItem("userInfo");
              localStorage.removeItem("userRole");
              localStorage.setItem("user", true);
              await localStorage.setItem("userInfo", JSON.stringify(userInfo));
              await localStorage.setItem("userRole", "individual");
              dispatch(setUserInfo(userInfo));

              console.log(res);
              router.push(`/${locale}/Employee/BoardEmployee`);
            })
            .catch((error) => {
              handleDelete(values.email);
              console.error("Error signing up:", error.code);
              console.log(error.message);
              setErrorCred({ userExist: error.code });
            });
          // User signed up successfully
        } catch (error) {
          console.error("Error:", error);
        }
      };
      sendUserData(values);
    },
  });
  function handleChangePhoneNumber(value) {
    // setValue(e);
    console.log(value);
    formik.setFieldValue("phoneNumber", value);
    // console.log(value);
  }
  return (
    <div className="bg-[url('/BG.jpeg')]  flex items-center justify-center  text-black max-w-screen min-h-screen">
      <div className="loginDiv my-4 w-11/12 flex md:w-8/12 lg:w-5/12 flex-col items-center justify-center bg-white rounded-2xl py-12 md:py-8">
        {/* <img src="/BG.jpeg" alt="sdfhsf" srcset="" /> */}
        <img
          src="https://static.wixstatic.com/media/23fb1b_684b7f2399ae47e4beea5f5987c613f0~mv2.jpg/v1/fill/w_137,h_120,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/logo_tekkolab.jpg"
          alt=""
          srcset=""
        />
        <h1 className="mb-6 text-2xl">Sign Up for an Individual</h1>

        <div className="w-full flex justify-center items-center">
          <form
            className=" flex w-11/12  flex-col items-center justify-center "
            onSubmit={formik.handleSubmit}>
            <div className="flex flex-col sm:flex-row justify-center items-center w-full">
              <div className="w-full mr-1">
                <p className="text-l">First Name :</p>
                <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                  <IoPersonSharp className="h-5 w-5" />

                  <input
                    className="px-4 w-full focus:outline-none"
                    type="text"
                    name="firstName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.firstName}
                  />
                </div>
                <p className="sm:hidden mb-4 text-red-500">
                  {" "}
                  {formik.errors.firstName &&
                    formik.touched.firstName &&
                    formik.errors.firstName}
                </p>
              </div>{" "}
              <div className="w-full ">
                <p className="text-l">Last Name :</p>
                <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                  <IoPersonSharp className="h-5 w-5" />

                  <input
                    className="px-4 w-full focus:outline-none"
                    type="test"
                    name="lastName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.lastName}
                  />
                </div>
                <p className="sm:hidden mb-4 text-red-500">
                  {" "}
                  {formik.errors.lastName &&
                    formik.touched.lastName &&
                    formik.errors.lastName}
                </p>
              </div>{" "}
            </div>
            <div className=" hidden px-4 sm:flex justify-center items-center w-full mb-2">
              <p className=" text-red-500 w-2/4">
                {formik.errors.firstName &&
                  formik.touched.firstName &&
                  formik.errors.firstName}
              </p>
              <p className=" text-red-500 w-2/4">
                {formik.errors.lastName &&
                  formik.touched.lastName &&
                  formik.errors.lastName}
              </p>
            </div>
            <div className="w-full">
              <p className="text-l">Email :</p>
              <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                <MdAlternateEmail className="h-5 w-5" />

                <input
                  className="px-4 w-full focus:outline-none"
                  type="email"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
              </div>
              <p className="mb-4 text-red-500">
                {" "}
                {formik.errors.email &&
                  formik.touched.email &&
                  formik.errors.email}
              </p>
            </div>{" "}
            <div className="w-full">
              <p className="text-l">Phone Number :</p>
              <PhoneInput
                defaultCountry="DZ"
                className="w-full h-10 focus:outline-none input rounded-xl px-4"
                placeholder="Enter phone number"
                value={value}
                onChange={handleChangePhoneNumber}
              />
              <p className="mb-4 text-red-500">
                {" "}
                {formik.errors.phoneNumber &&
                  formik.touched.phoneNumber &&
                  formik.errors.phoneNumber}
              </p>
            </div>
            <div className="w-full">
              <p className="text-l">Gender :</p>
              <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24">
                  <path d="M220-80v-300h-60v-220q0-33 23.5-56.5T240-680h120q33 0 56.5 23.5T440-600v220h-60v300H220Zm80-640q-33 0-56.5-23.5T220-800q0-33 23.5-56.5T300-880q33 0 56.5 23.5T380-800q0 33-23.5 56.5T300-720ZM600-80v-240H480l102-306q8-26 29.5-40t48.5-14q27 0 48.5 14t29.5 40l102 306H720v240H600Zm60-640q-33 0-56.5-23.5T580-800q0-33 23.5-56.5T660-880q33 0 56.5 23.5T740-800q0 33-23.5 56.5T660-720Z" />
                </svg>
                <Select
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      // borderColor: state.isFocused ? "grey" : "red",
                      borderWidth: state.isFocused ? 0 : 0,
                    }),
                  }}
                  placeholder="Select Gender"
                  className="w-full"
                  options={genders}
                  onChange={handleChangeGender}
                />
              </div>
              <p className="mb-4 text-red-500">
                {" "}
                {formik.errors.gender &&
                  formik.touched.gender &&
                  formik.errors.gender}
              </p>
            </div>
            <div className="w-full">
              <p className="text-l">Password :</p>
              <div className=" flex justify-start items-center px-2 input rounded-xl h-10 ">
                <MdOutlinePassword className="h-5 w-5" />

                <input
                  className="w-full  px-4 focus:outline-none"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                <span
                  className="cursor-pointer"
                  onClick={togglePasswordVisibility}>
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <IoEyeSharp className="w-5 h-5" />
                  )}
                </span>
              </div>
              <p className=" mb-4 text-red-500">
                {" "}
                {formik.errors.password &&
                  formik.touched.password &&
                  formik.errors.password}
              </p>
            </div>
            <div className="w-full">
              <p className="text-l">Confirm Password :</p>
              <div className=" flex justify-start items-center px-2 input rounded-xl h-10 ">
                <MdOutlinePassword className="h-5 w-5" />

                <input
                  className="w-full  px-4 focus:outline-none"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                />
                <span
                  className="cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <IoEyeSharp className="w-5 h-5" />
                  )}
                </span>
              </div>
              <p className=" mb-4 text-red-500">
                {" "}
                {formik.errors.confirmPassword &&
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword}
              </p>
            </div>
            <button
              className={`w-full  my-4 rounded border-b-4  px-4 py-2 font-bold text-white ${
                formik.isSubmitting
                  ? "border-violet-300 bg-violet-200 cursor-no-drop"
                  : "border-violet-700 bg-violet-500 hover:border-violet-500 hover:bg-violet-400"
              }  `}
              type="submit"
              disabled={formik.isSubmitting}>
              {!formik.isSubmitting ? (
                "Sign Up"
              ) : (
                <div className="flex justify-center items-center">
                  <span className="text-sm text-white">Loading</span>
                  <div className="h-6 w-6 loaderDots ml-2 "></div>{" "}
                </div>
              )}
            </button>
            <p className=" mb-4 text-red-500">
              {" "}
              {error?.userExist ? error?.userExist : null}
            </p>
          </form>
        </div>

        {/*<h1 className="mb-4 text-l">or continue with :</h1>
        <button
          type="button"
          className="w-5/6   text-white   bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between dark:focus:ring-[#4285F4]/55 mr-2 mb-2">
          <FaGoogle className="mr-2 -ml-1 w-4 h-4" />
          Sign up with Google<div></div>
        </button>*/}
        <p className="w-8/12 text-gray-600 text-center ">
          Have an Account ?{" "}
          <Link
            href={`/${locale}/In`}
            className="text-blue-700 hover:underline cursor-pointer">
            Login Here
          </Link>{" "}
        </p>

        <div className="border-t-2 border-blue-700 my-4 w-8/12 "></div>

        <p className="w-8/12 text-gray-600 text-center ">
          This page is protected by the Google{" "}
          <Link
            href={"#"}
            className="text-blue-700 hover:underline cursor-pointer">
            Privacy Policy
          </Link>{" "}
          and &nbsp;
          <Link
            href={"#"}
            className="text-blue-700 hover:underline cursor-pointer">
            Terms of Service
          </Link>{" "}
          apply.
        </p>
      </div>
    </div>
  );
}

export default Individuals;
