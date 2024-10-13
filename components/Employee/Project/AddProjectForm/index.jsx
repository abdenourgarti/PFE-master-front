"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { FaPlus, FaFileUpload } from "react-icons/fa";
import * as Yup from "yup";
import axios from "axios";
import Loader from "@/components/Loader";
import { Formik, Form, Field } from "formik";
import { GrValidate } from "react-icons/gr";
import { useLocale } from "next-intl";
import {
  IoSearchCircle,
  IoAddCircleSharp,
  IoCloseCircleSharp,
} from "react-icons/io5";
import "./style.css";

const axiosInstance = axios.create({
  baseURL: "https://pfe-master-backend.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
});

const fetchTeams = async (organizationId) => {
  try {
    const response = await axiosInstance.get(
      `/team/teams?Organization=${organizationId}`
    );
    const teams = response.data;
    return teams;
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes :", error);
    return [];
  }
};

const fetchUsers = async (organizationId) => {
  try {
    const response = await axiosInstance.get("/user/users", {
      params: {
        "roles.role": "prjctBoss",
        "roles.organization": organizationId,
      },
    });
    const users = response.data;

    // Filtrage côté client
    const filteredUsers = users.filter((user) =>
      user.roles.some(
        (role) =>
          role.role === "prjctBoss" &&
          role.organization &&
          role.organization._id === organizationId
      )
    );

    return filteredUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return [];
  }
};

const AddProjectForm = ({
  organization,
  handleCachAddProjectForm,
  reloadpage,
  reload,
}) => {
  const [availableTeams, setAvailableTeams] = useState();
  const [availableUsers, setAvailableUsers] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showInvitePeopleModal, setShowInvitePeopleModal] = useState(false);
  const [allPeople, setAllPeople] = useState([]);
  const [personFetched, setPersonFetched] = useState(false);
  const [reloadInvit, setReloadInvit] = useState(false);
  const [invitaions, setInvitaions] = useState([]);

  const locale = useLocale();

  function invitationSent(array, value) {
    return array.some((item) => item?.sendto?._id === value);
  }

  const handlePopupClose = () => {
    setShowPopup(false);
    handleCachAddProjectForm(); // Masquer le composant AddTaskForm
    reloadpage(reload);
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };
  // const organizationId = "66609ae2a974839772c60e7b";

  useEffect(() => {
    const fetchData = async () => {
      const teams = await fetchTeams(organization?._id);
      console.log("teams = ", teams);
      const users = await fetchUsers(organization?._id);
      setAvailableTeams(teams);
      setAvailableUsers(users);
    };

    fetchData();
  }, []);
  const loginDiv = {
    boxShadow:
      "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
  };

  const validationSchema = Yup.object().shape({
    projectName: Yup.string().required("Required"),
    description: Yup.string().required("Required"),
    startDate: Yup.date().required("Required"),
    dueDate: Yup.date().required("Required"),
    teams: Yup.array().min(1, "At least one team is required"),
    projectManager: Yup.string().required("Required"),
    documents: Yup.mixed().test(
      "fileSize",
      "File size is too large",
      (value) => {
        if (!value) return true; // Si aucun fichier n'est sélectionné, c'est valide
        return value && value[0] && value[0].size <= 5000000; // 5MB max
      }
    ),
  });

  const sendProjectData = async (values, setSubmitting) => {
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("Name", values.projectName);
      formData.append("Description", values.description);
      formData.append("dateDebutEstim", values.startDate);
      formData.append("dateFinEstim", values.dueDate);
      formData.append("organization", organization?._id);
      formData.append("boss", values.projectManager);

      // Assurez-vous que teams est toujours un tableau
      const teamsArray = Array.isArray(values.teams)
        ? values.teams
        : [values.teams];
      teamsArray.forEach((team) => formData.append("teams", team));

      if (values.documents) {
        for (let i = 0; i < values.documents.length; i++) {
          formData.append("documents", values.documents[i]);
        }
      }

      const response = await axiosInstance.post("/project/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const teamIds = values.teams.join(",");
      console.log("ids team = ", teamIds);
      const response2 = await axiosInstance.get(`/user/users?team=${teamIds}`);
      const membersToNotify = response2.data.map((user) => user._id);
      const usersToNotify = [values.projectManager, ...membersToNotify];
      const notificationContent = {
        message: `Un nouveau projet "${values.projectName}" a été créé.`,
        url: JSON.stringify(response.data), // Ajoutez l'URL appropriée pour accéder au projet
      };
      // Utilisez usersToNotify pour envoyer les notifications
      console.log("Users to notify:", usersToNotify);
      const response1 = await axiosInstance.post(
        "/notification/notifications",
        {
          recipients: usersToNotify,
          content: notificationContent,
          type: "project",
          organization: organization?._id,
          seen: usersToNotify.map((userId) => ({ userId, seen: false })),
        }
      );
      console.log("notif = ", response1.data);

      showPopupMessage("Project created successfully!"); // Afficher la pop-up de succès

      formik.resetForm(); // Réinitialiser les valeurs du formulaire
    } catch (error) {
      console.error("Error from backend:");
      console.log(error);
      showPopupMessage("An error occurred while creating the project."); // Afficher la pop-up d'erreur
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      projectName: "",
      description: "",
      startDate: "",
      dueDate: "",
      teams: [],
      projectManager: "",
      documents: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      sendProjectData(values, setSubmitting);
    },
  });

  const initialValuesSearchPerson = { email: "" };
  const handleSubmitSearchPerson = async (values, { setSubmitting }) => {
    try {
      const response = await axiosInstance.get("/user/users", {
        params: {
          email: values.email,
        },
      });
      // console.log("team created");
      setAllPeople(response.data);
      setPersonFetched(true);
      console.log(response.data);
      // setReload(!reload);
      // window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
    // Handle form submission logic here
    console.log("Form submitted with values:", values);
    setSubmitting(false);
  };

  const sendInvitaion = async (person) => {
    console.log(organization);
    try {
      const response = await axiosInstance.post("/invitation/invitations", {
        sendby: organization?.Boss?._id,
        sendto: person._id,
        roleinvitedto: "prjctBoss",
        organisation: organization?._id,
        accepted: false,
      });

      console.log(response.data);
      setReloadInvit(!reloadInvit);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // get invitations
  // <<<<<<< HEAD
  //   useEffect(() => {
  //     const getinvitations = async (values) => {
  //       const axiosInstance = axios.create({
  //         baseURL: "https://pfe-master-backend.vercel.app",
  //         headers: {
  //           "Content-Type": "application/json",
  // =======
  const getinvitations = async (values) => {
    const organization = JSON.parse(localStorage.getItem("organization"));
    try {
      const response = await axiosInstance.get("/invitation/invitations", {
        params: {
          organisation: organization?._id,
          // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
        },
      });
      console.log("invitaions");

      console.log(response.data);
      setInvitaions(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    getinvitations();
  }, []);

  useEffect(() => {
    getinvitations();
  }, [reloadInvit]);

  const getPeople = async (values) => {
    const roles = ["prjctBoss", "teamBoss", "employee", "individual"]; // Vous pouvez ajuster cette liste selon vos besoins

    try {
      const response = await axiosInstance.get("/user/users", {
        params: {
          roles: roles.join(","),
        },
      });
      const filterPeopleNotInOrganization = response.data.filter(
        (user) =>
          !user.roles.some(
            (role) =>
              role.organization && role.organization._id === organization?._id
          )
      );

      console.log("people ", filterPeopleNotInOrganization);
      setAllPeople(filterPeopleNotInOrganization);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getPeople();
  }, []);

  useEffect(() => {
    getPeople();
  }, [personFetched]);

  return (
    <>
      {availableUsers && availableTeams ? (
        <div
          style={loginDiv}
          className="w-11/12 flex md:w-8/12 h-fit lg:w-6/12 flex-col items-center justify-center bg-white rounded-2xl py-12 md:py-8">
          <h1 className="flex mb-6 justify-center items-center text-2xl">
            <FaPlus className="mr-4" />
            Add Project
          </h1>
          <form
            className="flex w-11/12 flex-col items-center justify-center"
            onSubmit={formik.handleSubmit}>
            <div className="w-full">
              <p className="text-l">Project Name :</p>
              <div className="flex justify-start items-center px-2 border-b border-[#314155] h-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm4.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7-7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  className="px-4 w-full focus:outline-none"
                  type="text"
                  name="projectName"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.projectName}
                />
              </div>
              <p className="mb-4 text-red-500">
                {formik.errors.projectName &&
                  formik.touched.projectName &&
                  formik.errors.projectName}
              </p>
            </div>

            <div className="w-full">
              <p className="text-l">Description :</p>
              <div className="flex justify-start items-center px-2 border-b border-[#314155] h-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25c0 1.035.84 1.875 1.875 1.875h13.75c1.035 0 1.875-.84 1.875-1.875V9.075c0-1.035-.84-1.875-1.875-1.875H9.75V4.875C9.75 3.84 8.91 3 7.875 3H3.375zm6 6.75V6h3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H9.375zm-3.75 0h2.25V6h-2.25V9.75z"
                    clipRule="evenodd"
                  />
                </svg>
                <textarea
                  className="px-4 w-full focus:outline-none"
                  name="description"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                />
              </div>
              <p className="mb-4 text-red-500">
                {formik.errors.description &&
                  formik.touched.description &&
                  formik.errors.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center w-full">
              <div className="w-full mr-1">
                <p className="text-l">Start Date :</p>
                <div className="flex justify-start items-center px-2 border-b border-[#314155] h-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75ZM5.25 6.75c-.621 0-1.125.504-1.125 1.125V18a1.125 1.125 0 0 0 1.125 1.125h13.5A1.125 1.125 0 0 0 19.875 18V7.875c0-.621-.504-1.125-1.125-1.125H5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    className="px-4 w-full focus:outline-none"
                    type="date"
                    name="startDate"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.startDate}
                  />
                </div>
                <p className="mb-4 text-red-500">
                  {formik.errors.startDate &&
                    formik.touched.startDate &&
                    formik.errors.startDate}
                </p>
              </div>
              <div className="w-full">
                <p className="text-l">Due Date :</p>
                <div className="flex justify-start items-center px-2 border-b border-[#314155] h-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75ZM5.25 6.75c-.621 0-1.125.504-1.125 1.125V18a1.125 1.125 0 0 0 1.125 1.125h13.5A1.125 1.125 0 0 0 19.875 18V7.875c0-.621-.504-1.125-1.125-1.125H5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    className="px-4 w-full focus:outline-none"
                    type="date"
                    name="dueDate"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dueDate}
                  />
                </div>
                <p className="mb-4 text-red-500">
                  {formik.errors.dueDate &&
                    formik.touched.dueDate &&
                    formik.errors.dueDate}
                </p>
              </div>
            </div>

            <div className="w-full">
              <div className="w-full flex justify-between items-center">
                <p className="text-l">Project Manager :</p>
                <button
                  type="button"
                  className="underline text-blue-600 hover:no-underline"
                  onClick={() => setShowInvitePeopleModal(true)}>
                  Invite People
                </button>
              </div>
              <div className="flex justify-start items-center px-2 border-b border-[#314155] h-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                    clipRule="evenodd"
                  />
                </svg>
                <select
                  value={formik.values.projectManager}
                  name="projectManager"
                  className="px-4 w-full focus:outline-none bg-white"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}>
                  <option value="" disabled>
                    Select a project manager
                  </option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.nom} {user.prenom}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mb-4 text-red-500">
                {formik.errors.projectManager &&
                  formik.touched.projectManager &&
                  formik.errors.projectManager}
              </p>
            </div>

            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 mr-2">
                    <path
                      fillRule="evenodd"
                      d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-l">Teams :</p>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={
                      formik.values.teams.length === availableTeams.length
                    }
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newTeams = checked
                        ? availableTeams.map((team) => team._id)
                        : [];
                      formik.setFieldValue("teams", newTeams);
                    }}
                  />
                  <label htmlFor="selectAll" className="ml-2">
                    Select All
                  </label>
                </div>
              </div>
              <div className="max-h-25 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTeams.map((team) => (
                    <div
                      key={team._id}
                      className="flex justify-center sm:justify-start items-center">
                      <input
                        type="checkbox"
                        id={`team-${team._id}`}
                        value={team._id}
                        checked={formik.values.teams.includes(team._id)}
                        onChange={(e) => {
                          const checkedTeams = e.target.checked
                            ? [...formik.values.teams, team._id]
                            : formik.values.teams.filter(
                                (id) => id !== team._id
                              );
                          formik.setFieldValue("teams", checkedTeams);
                        }}
                        className="mr-2"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 mr-2">
                        <path
                          fillRule="evenodd"
                          d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <label htmlFor={`team-${team._id}`} className="ml-2">
                        {team.Name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mb-4 text-red-500">
                {formik.errors.teams &&
                  formik.touched.teams &&
                  formik.errors.teams}
              </p>
            </div>
            <div className="w-full">
              <p className="text-l">Upload Documents :</p>
              <div className="flex justify-start items-center px-2 border-b border-[#314155] h-10">
                <FaFileUpload className="w-5 h-5" />
                <input
                  className="px-4 w-full focus:outline-none"
                  type="file"
                  name="documents"
                  multiple
                  onChange={(event) => {
                    formik.setFieldValue(
                      "documents",
                      event.currentTarget.files
                    );
                  }}
                />
              </div>
              <p className="mb-4 text-red-500">
                {formik.errors.documents &&
                  formik.touched.documents &&
                  formik.errors.documents}
              </p>
            </div>
            <button
              className="bg-[#314155] m-auto hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md mt-12 w-1/2 flex items-center justify-center"
              type="submit"
              disabled={formik.isSubmitting}>
              {formik.isSubmitting ? (
                <div className="flex justify-center items-center">
                  <span className="text-sm text-white">Loading</span>
                  <div className="h-6 w-6 loaderDots ml-2 "></div>{" "}
                </div>
              ) : (
                "Create Project"
              )}
            </button>
          </form>
          {/* invite people */}
          <div
            style={{
              width: "100vw",
              height: "100vh",
              backdropFilter: "blur(2px)",
              backgroundColor: "rgba(255, 255, 255, 0)",
            }}
            className={` fixed inset-0 z-50  overflow-y-auto justify-center items-center flex     ${
              showInvitePeopleModal
                ? "opacity-100 visible"
                : "opacity-0 invisible"
            } `}>
            <div className="w-[90vw]  md:w-[60vw] h-[90vh] myShadow relative mx-auto overflow-hidden   rounded-lg shadow-md bg-white">
              <div
                style={{ height: "10vh" }}
                className="flex justify-end items-center px-5 ">
                <button
                  type="button"
                  onClick={() => setShowInvitePeopleModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10L4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div
                style={{ height: "80vh" }}
                className=" flex flex-col justify-start items-center ">
                <h1 className="text-4xl font-bold py-6">
                  Organization: {organization.Name}
                </h1>

                <h1 className="text-3xl pb-6">
                  Invite a projects's managers to your organization
                </h1>
                <div className="w-10/12">
                  <Formik
                    initialValues={initialValuesSearchPerson}
                    onSubmit={handleSubmitSearchPerson}>
                    {({ isSubmitting }) => (
                      <Form className="bg-white flex justify-start items-center px-2 input rounded-2xl h-10">
                        <Field
                          className="px-4 w-full focus:outline-none"
                          type="text"
                          name="email"
                          placeholder="Email"
                        />
                        {!personFetched ? (
                          <button type="submit" disabled={isSubmitting}>
                            <IoSearchCircle className="text-blue-600 h-6 w-6" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault(); // Prevent default form submission
                              setPersonFetched(false);
                            }}>
                            <IoCloseCircleSharp className=" text-blue-600 h-6 w-6" />
                          </button>
                        )}
                      </Form>
                    )}
                  </Formik>
                </div>

                <div className="w-11/12 h-[50vh] overflow-auto costumScrollBar">
                  {allPeople.length > 0 ? (
                    allPeople.map((person, index) => (
                      <div
                        key={index}
                        className="border-b-2 border-gray-400   w-full  my-2 rounded-xl flex justify-between items-center p-2    ">
                        <div className="flex ">
                          <div className="  flex flex-col justify-center  items-center text-sm font-semibold text-gray-800 ">
                            <button className="h-8 w-8 relative flex justify-center items-center rounded-full bg-orange-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                              {person.prenom[0].toUpperCase()}{" "}
                              {person.nom[0].toUpperCase()}
                            </button>
                          </div>
                          <div className=" flex flex-col justify-center ml-4">
                            <div className="truncate  text-sm text-gray-600 ">
                              {person.prenom} {person.nom}
                            </div>
                            <div
                              className={`truncate  text-gray-800 font-semibold  text-sm `}>
                              {person.email}{" "}
                            </div>
                          </div>
                        </div>

                        <div className=" flex justify-center items-center">
                          {!invitationSent(invitaions, person._id) ? (
                            <button
                              type="button"
                              className="text-gray-600  hover:text-blue-500 focus:outline-none "
                              onClick={() => sendInvitaion(person)}>
                              {/* <FaTrash className="mr-1" /> */}
                              send
                            </button>
                          ) : (
                            <GrValidate className="mr-1 h-6 w-6 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full rounded-sm  my-4 py-2 text-gray-00 flex justify-center items-center text-gray-500 border-gray-600  border-2 border-dashed">
                      your people list is emptry
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {showPopup && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg">
                <p>{popupMessage}</p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handlePopupClose}>
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};
export default AddProjectForm;
