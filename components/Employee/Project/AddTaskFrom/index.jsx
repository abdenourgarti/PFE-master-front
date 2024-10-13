"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { FaPlus, FaFileUpload } from "react-icons/fa";
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

const AddTaskForm = ({
  parentProject,
  handleCachAddTaskForm,
  reloadpage,
  reload,
}) => {
  const [availableTeams, setAvailableTeams] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handlePopupClose = () => {
    setShowPopup(false);
    handleCachAddTaskForm(); // Masquer le composant AddTaskForm
    reloadpage(reload);
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const loginDiv = {
    boxShadow:
      "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
  };

  // const organizationId = "66609ae2a974839772c60e7b";
  // const projectId = "666357fcb6ef230e0e262884";
  useEffect(() => {
    const fetchData = async () => {
      const teams = await fetchTeams(parentProject?.organization?._id);
      console.log("teams = ", teams);

      setAvailableTeams(teams);
    };

    fetchData();
  }, []);

  const sendTaskData = async (values, setSubmitting) => {
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("Name", values.taskName);
      formData.append("Description", values.description);
      formData.append("priorite", values.priority);
      formData.append("dateDebutEstim", values.startDate);
      formData.append("dateFinEstim", values.dueDate);
      formData.append("projet", parentProject?._id);
      formData.append("team", values.assignedTo);

      if (values.documents) {
        for (let i = 0; i < values.documents.length; i++) {
          formData.append("documents", values.documents[i]);
        }
      }

      const response = await axiosInstance.post("/task/tasks", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("respons = ", response.data);

      const response3 = await axiosInstance.patch(
        `/project/projects/${parentProject?._id}`,
        {
          tasks: response.data._id,
        }
      );
      console.log("respons1 = ", response3.data);
      // const response2 = await axiosInstance.get(`/user/users?team=${values.assignedTo}&role=teamBoss`);
      //   const membersToNotify = response2.data.map(user => user._id);
      const assignedTeam = availableTeams.find(
        (team) => team._id === values.assignedTo
      );
      console.log("assigned team = ", assignedTeam);
      if (assignedTeam?.Boss) {
        const teamBoss = assignedTeam && assignedTeam.Boss._id;
        console.log("teamBoss = ", teamBoss);
        const notificationContent = {
          message: `Une nouvelle tâche "${values.taskName}" a été affectée à votre équipe.`,
          url: JSON.stringify(response.data), // Ajoutez l'URL appropriée pour accéder au projet
        };
        // Utilisez usersToNotify pour envoyer les notifications
        const response1 = await axiosInstance.post(
          "/notification/notifications",
          {
            recipients: [teamBoss],
            content: notificationContent,
            type: "task",
            organization: parentProject?.organization?._id,
            seen: [{ userId: teamBoss, seen: false }],
          }
        );
        console.log("notif = ", response1.data);
      }
      showPopupMessage("Task created successfully!"); // Afficher la pop-up de succès
      formik.resetForm(); // Réinitialiser les valeurs du formulaire
    } catch (error) {
      console.error("Error from backend:");
      console.log(error);
      showPopupMessage("An error occurred while creating the task."); // Afficher la pop-up d'erreur
    } finally {
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object().shape({
    taskName: Yup.string().required("Task Name is required"),
    description: Yup.string().required("Description is required"),
    startDate: Yup.date().required("Start Date is required"),
    dueDate: Yup.date().required("Due Date is required"),
    priority: Yup.string().required("Priority is required"),
    assignedTo: Yup.string().required("Assigned Team is required"),
    documents: Yup.mixed().test("fileSize", "File size is too large", (value) => {
      if (!value) return true; // If no file is selected, it's valid
      return value && value[0] && value[0].size <= 5000000; // 5MB max
    }),
  });

  const formik = useFormik({
    initialValues: {
      taskName: "",
      description: "",
      startDate: "",
      dueDate: "",
      priority: "",
      assignedTo: "",
      documents: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      sendTaskData(values, setSubmitting);
    },
  });

  return (
    <div
      style={loginDiv}
      className="w-11/12 flex md:w-8/12 h-fit lg:w-6/12 flex-col items-center justify-center bg-white rounded-2xl py-12 md:py-8">
      <h1 className="flex mb-6 text-2xl">
        <FaPlus className="mr-4" />
        Add Task
      </h1>
      <form
        className="flex w-11/12 flex-col items-center justify-center"
        onSubmit={formik.handleSubmit}>
        <div className="w-full">
          <p className="text-l">Task Name :</p>
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
              name="taskName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.taskName}
            />
          </div>
          <p className="mb-4 text-red-500">
            {formik.errors.taskName &&
              formik.touched.taskName &&
              formik.errors.taskName}
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

        <div className="w-full">
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

        <div className="w-full">
          <p className="text-l">Priority :</p>
          <div className="flex justify-start items-center px-2 border-b border-[#314155] h-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>

            <select
              value={formik.values.priority}
              name="priority"
              className="px-4 w-full focus:outline-none bg-white"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}>
              <option value="" disabled>
                Select a priority
              </option>
              <option value="A">A : must do</option>
              <option value="B">B : should do</option>
              <option value="C">C : nice to do</option>
              <option value="D">D : to delegate</option>
              <option value="E">E : eliminate</option>
            </select>
          </div>
          <p className="mb-4 text-red-500">
            {formik.errors.priority &&
              formik.touched.priority &&
              formik.errors.priority}
          </p>
        </div>

        <div className="w-full">
          <p className="text-l">Assigned Team :</p>
          <div className="flex justify-start items-center px-2 border-b border-[#314155] h-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 mr-2">
              <path
                fillRule="evenodd"
                d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                clipRule="evenodd"
              />
            </svg>

            <select
              value={formik.values.assignedTo}
              name="assignedTo"
              className="px-4 w-full focus:outline-none bg-white"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}>
              <option value="" disabled>
                Select a team
              </option>
              {availableTeams.map((team, index) => (
                <option key={index} value={team._id}>
                  {team.Name}
                </option>
              ))}
            </select>
          </div>
          <p className="mb-4 text-red-500">
            {formik.errors.assignedTo &&
              formik.touched.assignedTo &&
              formik.errors.assignedTo}
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
              formik.setFieldValue("documents", event.currentTarget.files);
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
          Create Task
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
    </div>
  );
};

export default AddTaskForm;
