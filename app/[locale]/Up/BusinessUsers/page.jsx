"use client";
import Link from "next/link";
import "./style.css";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import axios from "axios";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { auth } from "../../firebase/config";
import { FaGoogle } from "react-icons/fa";
import { FaLocationArrow, FaCity } from "react-icons/fa";
import { IoEyeSharp, IoPersonSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import {
  MdAlternateEmail,
  MdBusinessCenter,
  MdOutlinePassword,
} from "react-icons/md";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { setUserInfo } from "@/store/features/auth/authSlice";
import { setOrganization } from "@/store/features/organization/organizationSlice";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import AccountTypeCard from "@/components/AccountTypeCard";
import { Formik } from "formik";
import Select from "react-select";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Countries from "@/components/Countries";

const axiosInstance = axios.create({
  baseURL: "http://localhost:1937",
  headers: {
    "Content-Type": "application/json",
  },
});
const deleteUserfromDataBaseAndFireBase = async (email) => {
  const user = auth.currentUser;
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
      formik.setSubmitting(false); // Formik manages this automatically

      console.log("User deleted successfully");
      if (user) {
        try {
          await deleteUser(user);
          // User deleted successfully, handle redirection or message
        } catch (error) {
          // Handle deletion error
        }
      } else {
        // No user signed in
      }
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
function BusinessUsers() {
  const dispatch = useDispatch();

  const router = useRouter();
  const getOptionLabel = (option) => option.name;
  const getOptionValue = (option) => JSON.stringify(option);
  const countries = Countries;

  const [view, setView] = useState(1);
  const t = useTranslations("Index");
  const locale = useLocale();
  const [value, setValue] = useState();
  function handleChangePhoneNumber(value) {
    // setValue(e);
    formik.setFieldValue("phoneNumber", value);
    // console.log(value);
  }

  const [selectedCountry, setSelectedCountry] = useState(false);
  const [error, setErrorCred] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleChangeCountry = (selectedOption) => {
    setSelectedCountry(selectedOption);
    formik.setFieldValue("country", JSON.stringify(selectedOption));
    console.log("Selected option:", selectedOption);
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    lastName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    businessName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    country: Yup.string().required("Required"),
    state: Yup.string().required("Required"),
    city: Yup.string().required("Required"),
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
    await deleteUserfromDataBaseAndFireBase(email);
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
      phoneNumber: "",
      country: "",
      state: "",
      city: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    // <<<<<<< HEAD
    //     onSubmit: (values, actions) => {
    //       // console.log(JSON.stringify(values, null, 2));
    //       formik.setSubmitting(true);
    //       const axiosInstance = axios.create({
    //         baseURL: "http://localhost:1937",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //       });
    // =======
    onSubmit: async (values, actions) => {
      try {
        formik.setSubmitting(true);

        // Vérifier si l'organisation existe
        const orgExistsResponse = await axiosInstance.get(
          "/organization/organizations",
          {
            params: { Name: values.businessName },
          }
        );

        if (orgExistsResponse.data.length > 0) {
          setErrorCred({ userExist: "Organization with this name exists" });
          return;
        }

        // Vérifier si l'utilisateur existe
        const userExistsResponse = await axiosInstance.post(
          "/user/check-user-exists",
          {
            email: values.email,
            phoneNumber: values.phoneNumber,
          }
        );

        if (userExistsResponse.data.exists) {
          setErrorCred({
            userExist: "User with this email or phone number exists",
          });
          return;
        }

        // Créer l'utilisateur dans Firebase
        const firebaseUserCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        console.log("User created successfully in Firebase");

        // Créer l'utilisateur dans la base de données
        const userResponse = await axiosInstance.post("/user/users", {
          nom: values.firstName,
          prenom: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          password: values.password,
        });

        let userInfo = userResponse.data;
        console.log("User created successfully in database");

        // Créer l'organisation
        const orgResponse = await axiosInstance.post(
          "/organization/organizations",
          {
            email: values.email,
            Name: values.businessName,
            Boss: userInfo._id,
            country: values.country,
            province: values.state,
            street: values.city,
          }
        );

        const organizationInfo = orgResponse.data;
        console.log("Organization created successfully");

        // Mettre à jour l'utilisateur avec le rôle d'organisation
        const updatedUserResponse = await axiosInstance.patch(
          `/user/users?id=${userInfo._id}`,
          {
            roles: [{ role: "orgBoss", organization: organizationInfo._id }],
          }
        );

        userInfo = updatedUserResponse.data;
        console.log("User role updated successfully");
        // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57

        localStorage.removeItem("organization");
        localStorage.removeItem("user");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userRole");

        // Mise à jour du localStorage et du state
        localStorage.setItem("user", "true");
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        localStorage.setItem("organization", JSON.stringify(organizationInfo));
        localStorage.setItem("userRole", "orgBoss");
        dispatch(setUserInfo(userInfo));
        dispatch(setOrganization(organizationInfo));

        router.push(`/${locale}/Employee/BoardEmployee`);
      } catch (error) {
        console.error("Error:", error);
        if (error.response) {
          const backendError =
            error.response.data.errors?.[0]?.message ||
            error.response.data.message;
          setErrorCred({ userExist: backendError });
        } else if (error.code) {
          console.error("Firebase error:", error.code);
          setErrorCred({ userExist: error.code });
        } else {
          console.error("An unexpected error occurred:", error);
        }

        // Nettoyage en cas d'erreur
        try {
          if (values.email) {
            await deleteUserfromDataBaseAndFireBase(values.email);
          }
          if (organizationInfo) {
            // Utiliser la route de suppression par ID pour l'organisation
            await axiosInstance.delete(
              `/organization/organizations/${organizationInfo._id}`
            );
          }
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
      } finally {
        formik.setSubmitting(false);
      }
    },
  });
  return (
    <div className="bg-[url('/BG.jpeg')]  flex items-center justify-center  text-black max-w-screen min-h-screen">
      <div className="loginDiv my-4 w-11/12 flex md:w-8/12 lg:w-5/12 flex-col items-center justify-center bg-white rounded-2xl py-12 md:py-8">
        {/* <img src="/BG.jpeg" alt="sdfhsf" srcset="" /> */}
        <img
          src="https://static.wixstatic.com/media/23fb1b_684b7f2399ae47e4beea5f5987c613f0~mv2.jpg/v1/fill/w_137,h_120,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/logo_tekkolab.jpg"
          alt=""
        />
        <h1 className="mb-6 text-2xl">Sign Up for a Business</h1>

        <div className="w-full flex justify-center items-center">
          <form
            className=" flex w-11/12  flex-col items-center justify-center "
            onSubmit={formik.handleSubmit}>
            <div className="flex justify-start w-full px-2">
              <p className="text-l mb-2">Business Owner :</p>
            </div>
            {/* owner div */}
            <div className="rounded-2xl border p-4 w-full">
              <div className=" px-4  flex-col sm:flex-row flex justify-center items-center w-full  ">
                <div className="w-full  sm:mb-0 sm:mr-1">
                  <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                    <IoPersonSharp className="h-5 w-5" />

                    <input
                      className="px-4 w-full focus:outline-none"
                      type="text"
                      placeholder="First Name"
                      name="firstName"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.firstName}
                    />
                  </div>
                </div>{" "}
                <p className="sm:hidden text-red-500 w-full">
                  {" "}
                  {formik.errors.firstName &&
                    formik.touched.firstName &&
                    formik.errors.firstName}
                </p>
                <div className="w-full mt-2 sm:mt-0">
                  {/* <p className="text-l">Last Name :</p> */}
                  <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                    <IoPersonSharp className="h-5 w-5" />

                    <input
                      className="px-4 w-full focus:outline-none"
                      type="text"
                      placeholder="Last Name"
                      name="lastName"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lastName}
                    />
                  </div>
                </div>{" "}
                <p className="sm:hidden text-red-500 w-full">
                  {" "}
                  {formik.errors.lastName &&
                    formik.touched.lastName &&
                    formik.errors.lastName}
                </p>
              </div>
              <div className=" hidden px-4 sm:flex justify-center items-center w-full mb-2">
                <p className=" text-red-500 w-2/4">
                  {" "}
                  {formik.errors.firstName &&
                    formik.touched.firstName &&
                    formik.errors.firstName}
                </p>
                <p className=" text-red-500 w-2/4">
                  {" "}
                  {formik.errors.lastName &&
                    formik.touched.lastName &&
                    formik.errors.lastName}
                </p>
              </div>
            </div>
            <div className="flex justify-start w-full px-2 mt-4">
              <p className="text-l mb-2">Business Informations :</p>
            </div>
            {/* busniess div */}

            <div className=" w-full rounded-2xl p-4 border">
              <div className="w-full">
                <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                  <MdBusinessCenter className="h-5 w-5" />

                  <input
                    className="px-4 w-full focus:outline-none"
                    type="text"
                    name="businessName"
                    placeholder="Business Name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.businessName}
                  />
                </div>
                <p className="mb-4 text-red-500">
                  {" "}
                  {formik.errors.businessName &&
                    formik.touched.businessName &&
                    formik.errors.businessName}
                </p>
              </div>{" "}
              <div className="w-full">
                <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                  <MdAlternateEmail className="h-5 w-5" />
                  <input
                    className="px-4 w-full focus:outline-none"
                    type="text"
                    name="email"
                    placeholder="E-mail"
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
              </div>
              <div className="w-full">
                <PhoneInput
                  className="w-full h-10 focus:outline-none input rounded-xl px-4"
                  // defaultCountry="DZ"
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
              <p className="text-l mb-2">Address :</p>
              <div className="flex-col sm:flex-row   flex justify-center items-center w-full mb-2 ">
                <div className="w-full   sm:mb-0 sm:mr-1">
                  <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                    {!selectedCountry ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 -960 960 960"
                        width="24">
                        <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q20-22 36-47.5t26.5-53q10.5-27.5 16-56.5t5.5-59q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z" />
                      </svg>
                    ) : (
                      <img
                        className="h-6 w-6"
                        alt="United States"
                        src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${selectedCountry.code}.svg`}
                      />
                    )}
                    <Select
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          // borderColor: state.isFocused ? "grey" : "red",
                          borderWidth: state.isFocused ? 0 : 0,
                        }),
                      }}
                      placeholder="Country"
                      className="w-full"
                      options={countries}
                      onChange={handleChangeCountry}
                      getOptionLabel={getOptionLabel}
                      getOptionValue={getOptionValue}
                    />
                  </div>
                </div>
                <p className="sm:hidden w-full text-red-500 ">
                  {" "}
                  {formik.errors.country &&
                    formik.touched.country &&
                    formik.errors.country}
                </p>
                <div className="w-full mt-2 sm:mt-0 ">
                  <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                    <FaLocationArrow className="h-5 w-5" />

                    <input
                      className="px-4 w-full focus:outline-none"
                      type="text"
                      placeholder="State / Province"
                      name="state"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.state}
                    />
                  </div>
                </div>{" "}
                <p className="sm:hidden w-full text-red-500 ">
                  {" "}
                  {formik.errors.state &&
                    formik.touched.state &&
                    formik.errors.state}
                </p>
              </div>
              <div className="hidden sm:flex justify-center items-center w-full mb-2">
                <p className=" text-red-500 w-2/4">
                  {" "}
                  {formik.errors.country &&
                    formik.touched.country &&
                    formik.errors.country}
                </p>
                <p className=" text-red-500 w-2/4">
                  {" "}
                  {formik.errors.state &&
                    formik.touched.state &&
                    formik.errors.state}
                </p>
              </div>
              <div className="w-full">
                <div className="flex justify-start items-center px-2 input rounded-xl h-10 ">
                  <FaCity className="h-5 w-5" />

                  <input
                    className="px-4 w-full focus:outline-none"
                    type="text"
                    name="city"
                    placeholder="Street - City"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.city}
                  />
                </div>
                <p className="mb-4 text-red-500">
                  {" "}
                  {formik.errors.city &&
                    formik.touched.city &&
                    formik.errors.city}
                </p>
              </div>
            </div>
            {/* password */}
            <div className="w-full mt-4">
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

export default BusinessUsers;
