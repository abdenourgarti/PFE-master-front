"use client";
import React, { useEffect, useState } from "react";
import {
  FaUserAlt,
  FaUserEdit,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaBars,
  FaEdit,
  FaUserTie,
  FaBuilding,
  FaUsers,
  FaEnvelope,
} from "react-icons/fa";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MdSettings } from "react-icons/md";
import { useFormik } from "formik";
import * as yup from "yup";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import NavBarAuth from "@/components/NavBar/NavBarAuth";
import axios from "axios";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

const ProfileSettings = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordactuel, setShowPasswordactuel] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [reload, setReload] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const showPopupMessage = (message, success) => {
    setPopupMessage(message);
    setIsSuccess(success);
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    if (isSuccess) {
      handleSaveClick();
      setReload(!reload);
    }
  };

  useEffect(() => {
    const userinfo = localStorage.getItem("userInfo");
    if (userinfo) {
      setUserInfo(JSON.parse(userinfo));
    }
  }, [reload]);

  const axiosInstance = axios.create({
    baseURL: "http://localhost:1937",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const validationSchema = yup.object().shape({
    FirstName: yup.string().required("Le nom est requis"),
    LastName: yup.string().required("Le prénom est requis"),
    Password: yup
      .string()
      .test(
        "password-match",
        "Les mots de passe doivent correspondre",
        function (value) {
          return !value || value === this.parent.confirmPassword;
        }
      ),
    confirmPassword: yup
      .string()
      .test(
        "password-match",
        "Les mots de passe doivent correspondre",
        function (value) {
          return !value || value === this.parent.Password;
        }
      ),
    Passwordactuel: yup.string().required("Le mot de passe actuel est requis"),
    phoneNumber: yup.string().required("Le numéro de téléphone est requis"),
  });

  const sendUserData = async (values, setSubmitting) => {
    try {
      console.log(1);

      console.log(2);

      // Préparez les données à envoyer
      const updateData = {
        nom: values.FirstName,
        prenom: values.LastName,
        phoneNumber: values.phoneNumber,
      };

      // Vérifiez si un nouveau mot de passe a été saisi
      if (values.Password && values.Password.trim() !== "") {
        console.log(3);
        // Réauthentifiez l'utilisateur avant de changer le mot de passe
        const credential = EmailAuthProvider.credential(
          user.email,
          values.Passwordactuel // Assurez-vous que ce champ existe dans votre formulaire
        );
        console.log(4);
        await reauthenticateWithCredential(user, credential);
        console.log(5);

        // Mettez à jour le mot de passe dans Firebase
        await updatePassword(user, values.Password);
        console.log(6);

        // Ajoutez le nouveau mot de passe aux données à mettre à jour
        updateData.password = values.Password;
        console.log(7);
      }
      console.log(8);
      // Envoyez la requête PATCH avec les données mises à jour
      const response = await axiosInstance.patch(
        `/user/updateUser?id=${userInfo?._id}`,
        updateData
      );
      console.log("user mis à jour ", response.data);
      console.log(9);

      const response1 = await axiosInstance.get("/user/users", {
        params: { _id: response?.data?._id },
      });

      localStorage.removeItem("userInfo");
      localStorage.setItem("userInfo", JSON.stringify(response1.data[0]));

      showPopupMessage("User updated successfully!");
      formik.resetForm();
      return true;
    } catch (error) {
      console.error("Error from backend:", error);
      if (error.response) {
        console.error("Data:", error.response.data);
        console.error("Status:", error.response.status);
      } else if (error.request) {
        console.error("Request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      showPopupMessage(
        "An error occurred while updating the user: " +
          (error.response?.data?.message || error.message),
        false
      );
      return false; // Indique que l'opération a échoué
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      FirstName: "",
      LastName: "",
      Passwordactuel: "",
      Password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const success = await sendUserData(values, setSubmitting, user);
      setIsSuccess(success);
    },
  });

  useEffect(() => {
    const userinfo = localStorage.getItem("userInfo");
    if (userinfo) {
      setUserInfo(JSON.parse(userinfo));
    }
  }, []);

  useEffect(() => {
    if (userInfo) {
      formik.setFieldValue("FirstName", userInfo?.nom);
      formik.setFieldValue("LastName", userInfo?.prenom);
      formik.setFieldValue("phoneNumber", userInfo?.phoneNumber);
      setPhoneValue(userInfo?.phoneNumber);
    }
  }, [userInfo]);

  console.log("userInfo = ", userInfo);

  const handleCancel = () => {
    setIsEditMode(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setShowTooltip(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSaveClick = () => {
    setIsEditMode(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    // Ajouter ici la logique pour sauvegarder les modifications du profil
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePasswordactuelVisibility = () => {
    setShowPasswordactuel(!showPasswordactuel);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="min-h-fit">
      <NavBarAuth />
      <div className="py-20 px-5 h-full bg-[url('/BG.jpeg')]">
        <div className="bg-[#314155] h-16 flex items-center justify-center px-4 m-auto md:w-2/3 rounded-t-lg rounded-tr-lg">
          <MdSettings className="text-2xl text-white mr-4" />
          <h1 className="text-2xl text-white">Settings</h1>
        </div>
        <div className="flex flex-col m-auto md:w-2/3 h-fit bg-white p-2 sm:p-10 rounded-b-lg rounded-bl-lg shadow-md">
          <div className="flex items-center">
            <button className="bg-[#314155] text-2xl text-white rounded-full h-20 w-20 flex items-center justify-center mb-4 shadow-md">
              {userInfo?.nom[0]?.toUpperCase()}{" "}
              {userInfo?.prenom[0]?.toUpperCase()}
            </button>
            <div className="ml-6 flex-1">
              <h2 className="text-lg text-black font-semibold font-serif mb-1">
                {userInfo?.nom} {userInfo?.prenom}
              </h2>
            </div>
            {!isEditMode && (
              <div className="relative">
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="font-medium"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}>
                  <FaEdit className="text-4xl text-[#314155] hover:text-indigo-700" />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 bg-gray-800 text-white p-2 rounded-md shadow-lg z-10 w-32 text-center">
                    Modifier le profil
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-full">
            {isEditMode ? (
              <>
                <form
                  className="flex w-full text-black flex-col items-center justify-center"
                  onSubmit={formik.handleSubmit}>
                  <div className="w-full">
                    <div className="flex ml-6 mr-6 justify-start items-center px-2 input border-b border-[#314155] h-10">
                      <FaUserAlt className="text-gray-500 mr-2" />
                      <p className="text-l mr-2 w-24">Nom :</p>
                      <input
                        className="px-4 w-full focus:outline-none"
                        type="text"
                        name="FirstName"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.FirstName}
                      />
                    </div>
                    <p className="mb-4 text-red-500">
                      {formik.errors.FirstName &&
                        formik.touched.FirstName &&
                        formik.errors.FirstName}
                    </p>
                  </div>

                  <div className="w-full mt-4">
                    <div className="flex ml-6 mr-6 justify-start items-center px-2 input border-b border-[#314155] h-10">
                      <FaUserAlt className="text-gray-500 mr-2" />
                      <p className="text-l mr-2 w-24">Prénom :</p>
                      <input
                        className="px-4 w-full focus:outline-none"
                        type="text"
                        name="LastName"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.LastName}
                      />
                    </div>
                    <p className="mb-4 text-red-500">
                      {formik.errors.LastName &&
                        formik.touched.LastName &&
                        formik.errors.LastName}
                    </p>
                  </div>

                  <div className="w-full mt-4">
                    <div className="flex ml-6 mr-6 justify-start items-center pb-2 px-2 input border-b border-[#314155] h-10">
                      <FaPhone className="text-gray-500 mr-2" />
                      <p className="hidden sm:block text-l mr-2 w-24">Tél :</p>
                      <PhoneInput
                        value={formik.values.phoneNumber}
                        onChange={(value) => {
                          formik.setFieldValue("phoneNumber", value);
                        }}
                        onBlur={formik.handleBlur}
                        name="phoneNumber"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    {formik.touched.phoneNumber &&
                      formik.errors.phoneNumber && (
                        <p className="text-red-500 ml-6">
                          {formik.errors.phoneNumber}
                        </p>
                      )}
                  </div>

                  <p className="w-full text-left ml-6 mt-4 text-gray-500">
                    (Optionnel)
                  </p>
                  <div className="w-full mt-4">
                    <div className="flex ml-6 mr-6 justify-start items-center px-2 input border-b border-[#314155] h-10">
                      <FaLock className="text-gray-500 mr-2" />
                      <p className="text-l mr-2 whitespace-nowrap">
                        Mot de passe actuel :
                      </p>
                      <div className="flex-grow flex items-center">
                        <input
                          className="px-4 w-full focus:outline-none"
                          type={showPasswordactuel ? "text" : "password"}
                          name="Passwordactuel"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.Passwordactuel}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordactuelVisibility}
                          className="focus:outline-none ml-2">
                          {!showPasswordactuel ? (
                            <FaEyeSlash className="text-gray-500" />
                          ) : (
                            <FaEye className="text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mb-4 text-red-500">
                      {formik.errors.Passwordactuel &&
                        formik.touched.Passwordactuel &&
                        formik.errors.Passwordactuel}
                    </p>
                  </div>
                  <div className="w-full mt-4">
                    <div className="flex ml-6 mr-6 justify-start items-center px-2 input border-b border-[#314155] h-10">
                      <FaLock className="text-gray-500 mr-2" />
                      <p className="text-l mr-2 whitespace-nowrap">
                        Nouveau mot de passe :
                      </p>
                      <div className="flex-grow flex items-center">
                        <input
                          className="px-4 w-full focus:outline-none"
                          type={showPassword ? "text" : "password"}
                          name="Password"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.Password}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="focus:outline-none ml-2">
                          {!showPassword ? (
                            <FaEyeSlash className="text-gray-500" />
                          ) : (
                            <FaEye className="text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mb-4 text-red-500">
                      {formik.errors.Password &&
                        formik.touched.Password &&
                        formik.errors.Password}
                    </p>
                  </div>

                  <div className="w-full mt-4">
                    <div className="flex ml-6 mr-6 justify-start items-center px-2 input border-b border-[#314155] h-10">
                      <FaLock className="text-gray-500 mr-2" />
                      <p className="text-l mr-2 whitespace-nowrap">
                        Confirmer mot de passe :
                      </p>
                      <div className="flex-grow flex items-center">
                        <input
                          className="px-4 w-full focus:outline-none"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.confirmPassword}
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="focus:outline-none ml-2">
                          {!showConfirmPassword ? (
                            <FaEyeSlash className="text-gray-500" />
                          ) : (
                            <FaEye className="text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mb-4 text-red-500">
                      {formik.errors.confirmPassword &&
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword}
                    </p>
                  </div>

                  <div className="flex row w-full">
                    <button
                      className="bg-[#314155] hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md mt-12 w-1/2 flex items-center justify-center"
                      type="submit"
                      disabled={formik.isSubmitting}>
                      <FaEdit className="mr-2" />
                      Enregistrer
                    </button>
                    <button
                      className="bg-gray-100 ml-4 hover:bg-gray-200 text-black font-medium py-2 px-4 rounded-md mt-12 w-1/2 flex items-center justify-center"
                      type="button"
                      onClick={() => handleCancel()}>
                      Annuler
                    </button>
                  </div>
                </form>
                {showPopup && (
                  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg">
                      <p>{popupMessage}</p>
                      <button
                        className={`mt-4 ${
                          isSuccess ? "bg-green-500" : "bg-red-500"
                        } text-white px-4 py-2 rounded`}
                        onClick={handlePopupClose}>
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4 text-black pb-10">
                <div className="flex items-center ml-6 mr-6 mt-6 border-b border-[#314155] pb-4">
                  <label
                    htmlFor="name"
                    className="flex font-medium text-gray-700 w-24 mt-6">
                    <FaUserAlt className="mr-2 text-gray-500" />
                    Nom :
                  </label>
                  <p className="ml-8 mt-6">{userInfo?.nom}</p>
                </div>
                <div className="flex items-center ml-6 mr-6 mt-6 border-b border-[#314155] pb-4">
                  <label
                    htmlFor="firstname"
                    className="flex font-medium text-gray-700 w-24 mt-6">
                    <FaUserAlt className="mr-2 text-gray-500" />
                    Prénom :
                  </label>
                  <p className="ml-8 mt-6">{userInfo?.prenom}</p>
                </div>
                <div className="flex items-center ml-6 mr-6 mt-6 border-b border-[#314155] pb-4">
                  <FaEnvelope className="sm:mr-2 h-6 w-6 text-gray-500" />
                  <label
                    htmlFor="email"
                    className="hidden sm:block font-medium text-gray-700 w-24 ">
                    Email :
                  </label>
                  <p className="sm:ml-8 ml-2 sm:">{userInfo?.email}</p>
                </div>
                <div className="flex items-center ml-6 mr-6 border-b border-[#314155] pb-4">
                  <FaPhone className="sm:mr-2 h-6 w-6 text-gray-500" />
                  <label
                    htmlFor="phone"
                    className="hidden sm:block font-medium text-gray-700 w-26">
                    Tél :
                  </label>
                  <p className="sm:ml-8 ml-2">{userInfo?.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute(ProfileSettings);
