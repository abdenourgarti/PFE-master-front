"use client";
import React, { useState, useEffect, Fragment } from "react";
import { useFormik } from "formik";
import { FaEdit } from "react-icons/fa";
import * as Yup from "yup";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:1937",
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

const UpdateProjectForm = ({
  project,
  handleCachUpdateProjectForm,
  reloadpage,
  reload,
}) => {
  const [availableTeams, setAvailableTeams] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [projectData, setProjectData] = useState({});

  const handlePopupClose = () => {
    setShowPopup(false);
    handleCachUpdateProjectForm();
    reloadpage(reload); // Masquer le composant UpdateProjectForm
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };
  useEffect(() => {
    if (project) {
      formik.setFieldValue("projectName", project.Name);
      formik.setFieldValue("description", project.Description);
      formik.setFieldValue("startDate", project.dateDebutEstim);
      formik.setFieldValue("dueDate", project.dateFinEstim);
      formik.setFieldValue("projectManager", project.boss?._id);
      formik.setFieldValue("teams", project.teams);
    }
  }, [project]);

  const fetchProjectToUpdate = async (projectId) => {
    try {
      const response = await axiosInstance.get(
        `/project/projects?_id=${projectId}`
      );
      // const project = response.data[0];
      console.log("response = ", response.data[0]);
      setProjectData(response.data[0]);
      const response1 = await axiosInstance.patch(
        `/user/users?id=${values?.projectManager}`,
        {
          role: "prjctBoss",
        }
      );
      formik.resetForm();
      // return project;
    } catch (error) {
      console.error("Erreur lors de la récupération du projet :", error);
      // return null;
    }
  };

  const fetchAllData = async () => {
    try {
      const [teams, users] = await Promise.all([
        fetchTeams(project?.organization?._id),
        fetchUsers(project?.organization?._id),
      ]);
      setAvailableTeams(teams);
      setAvailableUsers(users);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  };

  useEffect(() => {
    fetchAllData();
    console.log("projet to = ", project);
    // fetchProjectToUpdate(projectId)
  }, []);

  const sendProjectData = async (values, setSubmitting) => {
    console.log("paaaaatchhhhh");
    setSubmitting(true);

    try {
      const response = await axiosInstance.patch(
        `/project/projects/${project?._id}`,
        {
          Name: values.projectName,
          Description: values.description,
          dateDebutEstim: values.startDate,
          dateFinEstim: values.dueDate,
          boss: values.projectManager,
          teams: values.teams,
        }
      );
      console.log(response.data);

      // Comparer les anciennes valeurs avec les nouvelles
      const oldProjectManager = project.boss._id;
      const newProjectManager = values.projectManager;
      const oldTeams = project.teams;
      console.log("oldTeams = ", oldTeams);
      const newTeams = values.teams;
      console.log("newTeams = ", newTeams);
      const removedTeams = oldTeams.filter(
        (teamId) => !newTeams.includes(teamId)
      );
      console.log("removedTeams = ", removedTeams);
      const addedTeams = newTeams.filter(
        (teamId) => !oldTeams.includes(teamId)
      );
      console.log("addedTeams = ", addedTeams);
      const unchangedTeams = oldTeams.filter((teamId) =>
        newTeams.includes(teamId)
      );
      console.log("unchangedTeams = ", unchangedTeams);

      // Cas 1 : Nouveau chef de projet seulement
      if (
        oldProjectManager !== newProjectManager &&
        removedTeams.length === 0 &&
        addedTeams.length === 0
      ) {
        const notificationContent = {
          message: `Vous avez été affecté en tant que chef de projet pour "${values.projectName}".`,
          url: JSON.stringify(response.data),
        };

        const response1 = await axiosInstance.post(
          "/notification/notifications",
          {
            recipients: [newProjectManager],
            content: notificationContent,
            type: "project",
            organization: project.organization?._id,
            seen: [{ userId: newProjectManager, seen: false }],
          }
        );
        console.log("notif1 = ", response1.data);

        const notificationContent1 = {
          message: `Le projet "${values.projectName}" a été mise à jour.`,
          url: JSON.stringify(response.data),
        };
        const teamIds = unchangedTeams.join(",");
        console.log("ids team = ", teamIds);
        const response2 = await axiosInstance.get(
          `/user/users?team=${teamIds}`
        );
        const membersToNotify = response2.data.map((user) => user._id);
        if (membersToNotify.length > 0) {
          const response3 = await axiosInstance.post(
            "/notification/notifications",
            {
              recipients: membersToNotify,
              content: notificationContent1,
              type: "project",
              organization: project.organization?._id,
              seen: membersToNotify.map((userId) => ({ userId, seen: false })),
            }
          );
          console.log("notif2 = ", response3.data);
        }
      }

      // Cas 2 : Changement dans les équipes seulement
      if (
        oldProjectManager === newProjectManager &&
        (removedTeams.length > 0 || addedTeams.length > 0)
      ) {
        const notificationContent = {
          message: `Le projet "${values.projectName}" a été mis à jour.`,
          url: JSON.stringify(response.data),
        };
        const response1 = await axiosInstance.post(
          "/notification/notifications",
          {
            recipients: [oldProjectManager],
            content: notificationContent,
            type: "project",
            organization: project.organization?._id,
            seen: [{ userId: oldProjectManager, seen: false }],
          }
        );
        console.log("notif1 = ", response1.data);
        if (unchangedTeams.length > 0) {
          const notificationContent1 = {
            message: `Le projet "${values.projectName}" a été mise à jour.`,
            url: JSON.stringify(response.data),
          };
          const teamIds = unchangedTeams.join(",");
          console.log("ids team = ", teamIds);
          const response2 = await axiosInstance.get(
            `/user/users?team=${teamIds}`
          );
          const membersToNotify = response2.data.map((user) => user._id);
          if (membersToNotify.length > 0) {
            const response3 = await axiosInstance.post(
              "/notification/notifications",
              {
                recipients: membersToNotify,
                content: notificationContent1,
                type: "project",
                organization: project.organization?._id,
                seen: membersToNotify.map((userId) => ({
                  userId,
                  seen: false,
                })),
              }
            );
            console.log("notif2 = ", response3.data);
          }
        }
        if (addedTeams.length > 0) {
          const notificationContent1 = {
            message: `Le projet "${values.projectName}" a été affecté à votre équipe.`,
            url: JSON.stringify(response.data),
          };
          const teamIds = addedTeams.join(",");
          console.log("ids team = ", teamIds);
          const response2 = await axiosInstance.get(
            `/user/users?team=${teamIds}`
          );
          const membersToNotify = response2.data.map((user) => user._id);
          if (membersToNotify.length > 0) {
            const response3 = await axiosInstance.post(
              "/notification/notifications",
              {
                recipients: membersToNotify,
                content: notificationContent1,
                type: "project",
                organization: project.organization?._id,
                seen: membersToNotify.map((userId) => ({
                  userId,
                  seen: false,
                })),
              }
            );
            console.log("notif3 = ", response3.data);
          }
        }
      }

      // Cas 3 : Nouveau chef de projet et changement dans les équipes
      if (
        oldProjectManager !== newProjectManager &&
        (removedTeams.length > 0 || addedTeams.length > 0)
      ) {
        const notificationContent = {
          message: `Vous avez été affecté en tant que chef de projet pour "${values.projectName}".`,
          url: JSON.stringify(response.data),
        };
        const response1 = await axiosInstance.post(
          "/notification/notifications",
          {
            recipients: [newProjectManager],
            content: notificationContent,
            type: "project",
            organization: project.organization?._id,
            seen: [{ userId: newProjectManager, seen: false }],
          }
        );
        console.log("notif1 = ", response1.data);
        if (unchangedTeams.length > 0) {
          const notificationContent1 = {
            message: `Le projet "${values.projectName}" a été mise à jour.`,
            url: JSON.stringify(response.data),
          };
          const teamIds = unchangedTeams.join(",");
          console.log("ids team = ", teamIds);
          const response2 = await axiosInstance.get(
            `/user/users?team=${teamIds}`
          );
          const membersToNotify = response2.data.map((user) => user._id);
          if (membersToNotify.length > 0) {
            const response3 = await axiosInstance.post(
              "/notification/notifications",
              {
                recipients: membersToNotify,
                content: notificationContent1,
                type: "project",
                organization: project.organization?._id,
                seen: membersToNotify.map((userId) => ({
                  userId,
                  seen: false,
                })),
              }
            );
            console.log("notif2 = ", response3.data);
          }
        }
        if (addedTeams.length > 0) {
          const notificationContent1 = {
            message: `Le projet "${values.projectName}" a été affecté à votre équipe.`,
            url: JSON.stringify(response.data),
          };
          const teamIds = addedTeams.join(",");
          console.log("ids team = ", teamIds);
          const response2 = await axiosInstance.get(
            `/user/users?team=${teamIds}`
          );
          const membersToNotify = response2.data.map((user) => user._id);
          if (membersToNotify.length > 0) {
            const response3 = await axiosInstance.post(
              "/notification/notifications",
              {
                recipients: membersToNotify,
                content: notificationContent1,
                type: "project",
                organization: project.organization?._id,
                seen: membersToNotify.map((userId) => ({
                  userId,
                  seen: false,
                })),
              }
            );
            console.log("notif3 = ", response3.data);
          }
        }
      }

      // Cas 4 : Aucun changement dans le chef de projet et les équipes
      if (
        oldProjectManager === newProjectManager &&
        removedTeams.length === 0 &&
        addedTeams.length === 0
      ) {
        const notificationContent = {
          message: `Un projet "${values.projectName}" a été mis à jour.`,
          url: JSON.stringify(response.data),
        };
        const teamIds = unchangedTeams.join(",");
        console.log("ids team = ", teamIds);
        const response2 = await axiosInstance.get(
          `/user/users?team=${teamIds}`
        );
        const membersToNotify = response2.data.map((user) => user._id);
        const usersToNotify = [oldProjectManager, ...membersToNotify];
        const response1 = await axiosInstance.post(
          "/notification/notifications",
          {
            recipients: usersToNotify,
            content: notificationContent,
            type: "project",
            organization: project.organization?._id,
            seen: usersToNotify.map((userId) => ({ userId, seen: false })),
          }
        );
        console.log("notif = ", response1.data);
      }

      showPopupMessage("Project updated successfully!");
      formik.resetForm();
    } catch (error) {
      console.error("Error from backend:");
      console.log(error);
      showPopupMessage("An error occurred while updating the project.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const loginDiv = {
    boxShadow:
      "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
  };

  const formik = useFormik({
    initialValues: project,
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      projectName: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      startDate: Yup.date().required("Required"),
      dueDate: Yup.date().required("Required"),
      teams: Yup.array().min(1, "At least one team is required"),
      projectManager: Yup.string().required("Required"),
    }),
    onSubmit: (values, { setSubmitting }) => {
      sendProjectData(values, setSubmitting);
    },
  });

  return (
    <div
      style={loginDiv}
      className="w-11/12 flex md:w-8/12 h-fit lg:w-6/12 flex-col items-center justify-center bg-white rounded-2xl py-12 md:py-8">
      {projectData ? (
        <Fragment>
          <h1 className="flex mb-6 justify-center items-center text-2xl">
            <FaEdit className="mr-4" />
            Update Project
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
                    value={
                      formik.values.startDate
                        ? new Date(formik.values.startDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
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
                    value={
                      formik.values.dueDate
                        ? new Date(formik.values.dueDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
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
              <p className="text-l">Project Manager :</p>
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
                    <option
                      key={user._id}
                      value={user._id}
                      selected={user._id === project.boss._id}>
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
                      formik.values.teams &&
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
                        checked={
                          formik.values.teams &&
                          formik.values.teams.includes(team._id)
                        }
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const checkedTeams = isChecked
                            ? [...(formik.values.teams || []), team._id]
                            : (formik.values.teams || []).filter(
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
                "Update Project"
              )}
            </button>
          </form>
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
        </Fragment>
      ) : (
        <div>Chargement des données du projet...</div>
      )}
    </div>
  );
};

export default UpdateProjectForm;
