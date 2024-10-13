"use client";
import TaskDetails from "@/components/Employee/components/TaskDetails";
import { Fragment, useState, useEffect } from "react";

import {
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaClipboardList,
  FaUserFriends,
  FaExclamationCircle,
  FaUserCircle,
  FaTimes,
  FaTasks,
  FaClock,
  FaClipboardCheck,
  FaCheck,
  FaTrash
} from "react-icons/fa";
import { MdDelete, MdEditDocument } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import "./style.css";
import ProtectedRoute from "@/components/ProtectedRoute";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import Select from "react-select";
import { components, Option } from "react-select";
import { FaCircleDown } from "react-icons/fa6";
import {
  MdAlternateEmail,
  MdBusinessCenter,
  MdArrowDropDown,
  MdOutlinePassword,
} from "react-icons/md";
import { FaShare } from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import Loader from "@/components/Loader";
import Link from "next/link";
import NavBarAuth from "@/components/NavBar/NavBarAuth";
import React from "react";
import UserCard from "@/components/Employee/userCard";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { pdfjs, Document, Page } from "react-pdf";
import { GrValidate } from "react-icons/gr";
import axios from "axios";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import UpdateTaskForm from "@/components/Employee/Project/UpdateTaskForm";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const TaskPage = () => {
  // <<<<<<< HEAD
  const [showUserCard, setShowUserCard] = useState(false);
  const [userCardInfo, setUserCardInfo] = useState({});
  // =======
  const [showDelegationRequest, setShowDelegationRequest] = useState(false);
  const [userFullName, setUserFullName] = useState("Nom Prénom"); // Remplacez par les données appropriées
  const [idDelegation, setIdDelegation] = useState(null);
  const [userId, setUserId] = useState(null);
  const [reload, setReload] = useState(false);
  const handleAccept = async () => {
    try {
      const reponse1 = await axiosInstance.patch(`/task/tasks/${taskId}`, {
        affectedto: userInfo?._id,
      });
      console.log("taskUpdated = ", reponse1.data);
      const notificationContent = {
        message: `"${userInfo?.nom} ${userInfo?.prenom}" a accepté votre demande pour lui déléguer la tâche "${taskData?.Name}".`,
        url: JSON.stringify(taskData), // Ajoutez l'URL appropriée pour accéder au projet
      };
      const reponse2 = await axiosInstance.post("/notification/notifications", {
        recipients: [userId],
        content: notificationContent,
        type: "delegation",
        organization: organization?._id,
        seen: [{ userId: userId, seen: false }],
      });
      console.log("Notif après accept = ", reponse2.data);
      const reponse4 = await axiosInstance.patch(
        `delegation/delegations/updateDelegations/${taskData?._id}/${userId}`,
        {
          annuler: true,
          accepted: false,
        }
      );
      const reponse3 = await axiosInstance.patch(
        `delegation/delegations/${idDelegation}`,
        {
          annuler: false,
          accepted: true,
        }
      );
      console.log("accepter = ", reponse3.data);

      setShowDelegationRequest(false);
      setReload(!reload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDecline = async () => {
    try {
      const reponse = await axiosInstance.patch(
        `delegation/delegations/${idDelegation}`,
        {
          annuler: true,
          accepted: false,
        }
      );
      console.log("annuler = ", reponse.data);
      setShowDelegationRequest(false);
    } catch (error) {
      console.log(error);
    }
  };  
  const [delegationStatus, setDelegationStatus] = useState({});
  const [Details, setDetails] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const Status = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];
  const patchTaskStatus = async (newStatus) => {
    let valeurs;
    let message;
    const currentDate = new Date().toISOString();
    switch (taskData?.status) {
      case "Todo":
        valeurs = {
          status: newStatus,
          dateDebutReel: currentDate,
        };
        if (newStatus === "Cancel") {
          message = `La tache ${taskData?.Name} a été annulée.`;
        }
        break;
      case "Inprogress":
        valeurs = {
          status: newStatus,
          dateFinReel: currentDate,
        };
        if (newStatus === "Cancel") {
          message = `La tache ${taskData?.Name} a été annulée.`;
        } else
          message = `La tache ${taskData?.Name} est mise pour votre validation.`;
        break;
      case "Inreview":
        valeurs = {
          status: newStatus,
        };
        if (newStatus === "Cancel") {
          message = `La tache ${taskData?.Name} a été annulée.`;
        } else if (newStatus === "Done") {
          message = `La tache ${taskData?.Name} a été validée par le chef d'équipe.`;
        } else
          message = `La tache ${taskData?.Name} a été refusée par le chef d'équipe, vous devez la refaire.`;
        break;
      default:
        valeurs = {
          status: newStatus,
        };
        message = null;
        break;
    }

    try {
      const response = await axiosInstance.patch(
        `/task/tasks/${taskId}`,
        valeurs
      );
      const updatedTask = response.data;
      console.log("taskupdate ", response.data);
      fetchTask(taskId);
      if (message) {
        const notificationContent = {
          message: message,
          url: JSON.stringify(response.data), // Ajoutez l'URL appropriée pour accéder au projet
        };
        let usersToNotify;
        if (newStatus === "Inreview") {
          usersToNotify = response.data?.team.Boss;
        } else usersToNotify = response.data?.affectedto;

        const response1 = await axiosInstance.post(
          "/notification/notifications",
          {
            recipients: [usersToNotify],
            content: notificationContent,
            type: "task",
            organization: organization?._id,
            seen: [{ userId: usersToNotify, seen: false }],
          }
        );
        console.log("notif = ", response1.data);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ nextNumPages }) => {
    setNumPages(nextNumPages);
  };
  const handleDeleteDocument = async (documentName) => {
    try {
      const response = await axiosInstance.patch(`/task/deleteDocument/${taskData?._id}`, {
        fileName : documentName
      })
      console.log(`Deleting document: ${documentName}`);
      setReload(!reload);
    } catch (error) {
      
    }
    
  };
  const locale = useLocale();

  const [teamMembres, setTeamMembres] = useState(null);
  const searchParams = useSearchParams();
  const taskDetails = searchParams.get("taskDetails");
  const [Assigned, setAssigned] = useState(false);
  const [ShowDetails, setShowDetails] = useState(true);
  const [sent, setSent] = useState(true);
  // Décoder les données de la tâche à partir de l'URL
  const task = taskDetails ? JSON.parse(decodeURIComponent(taskDetails)) : null;
  const [taskData, setTaskData] = useState({});
  const [showUpdateTaskForm, setShowUpdateTaskForm] = useState(false);
  const taskId = JSON.parse(searchParams.get("task"));

  const transformStatus = (status) => {
    switch (status) {
      case "Todo":
        return "To Do";
        break;
      case "Inprogress":
        return "In Progress";
        break;
      case "Inreview":
        return "In Review";
        break;
      case "Done":
        return "Done";
        break;
      case "Cancel":
        return "Canceled";
        break;
    }
  };

  const handleCachUpdateTaskForm = () => {
    setUpdateIssueModal(false);
    setShowUpdateTaskForm(false);
  };
  const handleShowUpdateTaskForm = () => {
    setUpdateIssueModal(true);
    setShowUpdateTaskForm(true);
  };
  const axiosInstance = axios.create({
    baseURL: "http://localhost:1937",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const [userInfo, setUserInfo] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      const role = localStorage.getItem("userRole");
      if (userinfo && orga && role) {
        let userJson = JSON.parse(userinfo);
        setUserInfo(userJson);
        setUserRole(role);
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);
      }
    }
  }, []);

  const fetchTask = async (taskId) => {
    try {
      const response = await axiosInstance.get(`/task/tasks?_id=${taskId}`);
      const taskDat = response.data[0];
      console.log("taskDat = ", response.data[0]);
      setTaskData(taskDat);
      if (taskDat?.affectedto) setAssigned(true);
      else setAssigned(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes :", error);
    }
  };

  const fetchTeam = async (teamId, organizationId) => {
    try {
      // Utiliser la requête existante
      const response = await axiosInstance.get(
        `/user/users?team=${teamId}&roles.role=employee`
      );
      const allTeamMembers = response.data;
      console.log("Tous les membres d'équipe = ", allTeamMembers);

      // Filtrer côté client pour obtenir les membres spécifiques à l'organisation
      const filteredTeamMembers = allTeamMembers.filter(
        (user) =>
          user.team.includes(teamId) && // Vérifier que l'utilisateur est dans l'équipe
          user.roles.some(
            (role) =>
              role.role === "employee" &&
              role.organization &&
              role.organization._id === organizationId
          )
      );

      console.log("Membres d'équipe filtrés = ", filteredTeamMembers);
      setTeamMembres(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des membres d'équipe :",
        error
      );
    }
  };
  const [reloadAssigned, setReloadAssigned] = useState(false);
  const [reloadComments, setReloadComments] = useState(false);
  const [reloadDelegation, setReloadDelegation] = useState(false);
  useEffect(() => {
    fetchTask(taskId);
    fetchComments(taskId);
  }, []);
  useEffect(() => {
    // fetchTask(taskId);
    fetchComments(taskId);
  }, [reloadComments]);

  useEffect(() => {
    fetchTask(taskId);
    fetchComments(taskId);
  }, [reloadAssigned, reloadDelegation, reload]);

  useEffect(() => {
    if (taskData?.team?._id) {
      fetchTeam(taskData?.team?._id, organization?._id);
    }
  }, [taskData]);

  const assignTask = async (person) => {
    try {
      const response = await axiosInstance.patch(`/task/tasks/${taskId}`, {
        affectedto: person._id,
      });
      const taskDat = response.data;
      console.log("taskassigned = ", response.data);
      const notificationContent = {
        message: `La tâche "${response.data.Name}" a été affectée à toi.`,
        url: JSON.stringify(response.data), // Ajoutez l'URL appropriée pour accéder au projet
      };
      const response1 = await axiosInstance.post(
        "/notification/notifications",
        {
          recipients: [person._id],
          content: notificationContent,
          type: "task",
          organization: organization?._id,
          seen: [{ userId: person._id, seen: false }],
        }
      );
      console.log("notif = ", response1.data);
      setTaskData(taskDat);
      setShowAssigneeModal(false);
      setReloadAssigned(!reloadAssigned);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tache :", error);
    }
  };

  const delegatedTask = async (person) => {
    try {
      const response = await axiosInstance.post(`/delegation/delegations`, {
        sendby: userInfo?._id,
        sendto: person._id,
        task: taskData?._id,
        team: taskData?.team?._id,
        organisation: organization?._id,
      });
      const delegDat = response.data;
      console.log("demande delegation = ", response.data);
      const notificationContent = {
        message: `"${userInfo?.nom} ${userInfo?.prenom}" vous a envoyé une demande pour vous déléguer la tâche "${taskData?.Name}".`,
        url: JSON.stringify(taskData), // Ajoutez l'URL appropriée pour accéder au projet
      };
      const response1 = await axiosInstance.post(
        "/notification/notifications",
        {
          recipients: [person._id],
          content: notificationContent,
          type: "delegation",
          organization: organization?._id,
          seen: [{ userId: person._id, seen: false }],
        }
      );
      console.log("notif = ", response1.data);
      setReloadDelegation(!reloadDelegation);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tache :", error);
    }
  };

  const loadDelegationStatuses = async () => {
    const statuses = {};
    for (const person of teamMembres) {
      try {
        const response = await axiosInstance.get(`/delegation/delegations`, {
          params: {
            sendby: userInfo?._id,
            sendto: person._id,
            task: taskData?._id,
          },
        });
        statuses[person._id] = response.data.length > 0;
        if (
          response.data.length > 0 &&
          person._id === response.data[0].sendto._id &&
          person._id === userInfo?._id &&
          response.data[0].accepted === false &&
          response.data[0].annuler === false
        ) {
          const fullName = `${response.data[0].sendby.nom} ${response.data[0].sendby.prenom}`;
          setUserFullName(fullName);
          setUserId(response.data[0].sendby._id);
          setIdDelegation(response.data[0]._id);
          setShowDelegationRequest(true);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du statut de délégation :",
          error
        );
        statuses[person._id] = false;
      }
    }
    setDelegationStatus(statuses);
    // if(delegationStatus[userInfo?._id]){
    //   setShowDelegationRequest(true)
    // }
  };

  const getDelegationForUser = async () => {
    for (const person of teamMembres) {
      try {
        const response = await axiosInstance.get(`/delegation/delegations`, {
          params: {
            sendby: person._id,
            sendto: userInfo?._id,
            task: taskData?._id,
          },
        });
        if (
          response.data.length > 0 &&
          response.data[0].accepted === false &&
          response.data[0].annuler === false
        ) {
          const fullName = `${response.data[0].sendby.nom} ${response.data[0].sendby.prenom}`;
          setUserFullName(fullName);
          setUserId(response.data[0].sendby._id);
          setIdDelegation(response.data[0]._id);
          setShowDelegationRequest(true);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du statut de délégation :",
          error
        );
      }
    }
    
  };

  useEffect(() => {
    if (teamMembres && taskData) {
      loadDelegationStatuses();
      getDelegationForUser();
    }
  }, [teamMembres, taskData]);

  const fetchComments = async (taskId) => {
    try {
      const response = await axiosInstance.get(
        `/comment/comments?taskId=${taskId}`
      );
      const comments = response.data;
      console.log("comments = ", response.data);
      setComments(comments);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes :", error);
    }
  };
  function convertDateFormat(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
  }

  const [comments, setComments] = useState([]);
  const validationSchema = Yup.object().shape({
    comment: Yup.string().required("Le commentaire est requis"),
    comment: Yup.string().required("Le commentaire ne doit pas etre vide"),
  });

  const handleAddComment = async (values, resetForm, task, userId) => {
    try {
      const response = await axiosInstance.post(`/comment/comments`, {
        content: values.comment,
        taskId: task._id,
        authorId: userId,
      });
      const comment = response.data;
      console.log("comment = ", response.data);
      const notificationContent = {
        message: `Un commentaire a été rajouter sur la tâche "${task.Name}".`,
        url: JSON.stringify(task), // Ajoutez l'URL appropriée pour accéder au projet
      };
      const response1 = await axiosInstance.post(
        "/notification/notifications",
        {
          recipients: [task.projet.boss, task.team.Boss],
          content: notificationContent,
          type: "comment",
          organization: organization?._id,
          seen: [
            { userId: task.projet.boss, seen: false },
            { userId: task.team.Boss, seen: false },
          ],
        }
      );
      console.log("notif = ", response1.data);

      // fetchComments(taskId);
      setReloadComments(!reloadComments);
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes :", error);
    }
  };
  let text =
    "Import trace for requested module:Import trace for requestedmodule: Import trace for requested module:Import trace forrequested module:Import trace for requested module:Import tracefor requested module:Import trace for requested module:Importtrace for requested module:Import trace for requestedmodule:Import trace for requested module:Import trace forrequested module:Import trace for requested module:";
  const [showMore, setShowMore] = useState(false);
  let showMoreButton = text.length >= 250 ? true : false;
  // const [showMoreButton, setShowMoreButton] = useState(false);

  const handleDownload = (imageUrl) => {
    console.log("object");
    // Implement your download logic here (explained in step 4)
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageUrl.split("/").pop()
      ? imageUrl.split("/").pop()
      : "photo "; // Adjust the filename extension as needed
    link.click();
  };

  const ImageItem = ({ image, onClick, handleDownload }) => {
    return (
      <div style={{ position: "relative" }}>
        <FaCircleDown
          onClick={handleDownload}
          className="text-white hover:text-blue-400 download w-7 h-7"
          style={{ position: "absolute", bottom: "20px", right: "60px" }}
        />

        <img
          src={image.original}
          alt={image.originalAlt}
          onClick={onClick}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  };
  const renderItem = (item) => (
    <ImageItem
      image={item}
      onClick={() => {
        /* Handle image click if needed */
      }}
      handleDownload={() => handleDownload(item.original)} // Pass download logic
    />
  );
  const options = {
    cMapUrl: "/cmaps/",
    standardFontDataUrl: "/standard_fonts/",
  };
  const [file, setFile] = useState("./walid.pdf");
  const [ShowTitle, setShowTitle] = useState(true);
  const [ShowDescription, setShowDescription] = useState(true);
  const [ShowComments, setShowComments] = useState(true);
  const [MobileScreen, setMobileScreen] = useState(false);
  const [ShowShareModal, setShowShareModal] = useState(false);
  const [updateIssueModal, setUpdateIssueModal] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  useEffect(() => {
    async function setWindowDim() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      setLoading(false);
    }

    setWindowDim();
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener when component mounts
    window.addEventListener("resize", handleResize);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  function getColor(letter) {
    // Vérifiez si letter n'est pas undefined
    if (typeof letter !== "undefined") {
      switch (letter.toLowerCase()) {
        case "a":
          return "red";
        case "b":
          return "orange";
        case "c":
          return "green";
        case "d":
          return "yellow";
        case "e":
          return "gray";
        default:
          return "black";
      }
    }
    // Si letter est undefined, retournez une couleur par défaut
    return "black";
  }

  function getIcon(status) {
    switch (status) {
      case "todo":
        return (
          <img
            className="h-6 mr-2 w-auto"
            src="/images/list.png"
            alt=""
            srcSet=""
          />
        );

        break;
      case "inprogress":
        return (
          <img
            className="h-6 mr-2 w-auto"
            src="/images/development.png"
            alt=""
            srcSet=""
          />
        );

        break;
      case "inreview":
        return (
          <img
            className="h-6 mr-2 w-auto"
            src="/images/code-review.png"
            alt=""
            srcSet=""
          />
        );

        break;
      case "done":
        return (
          <img
            className="h-6 mr-2 w-auto"
            src="/images/checkbox.png"
            alt=""
            srcSet=""
          />
        );
        break;
      case "cancel":
        return (
          <img
            className="h-6 mr-2 w-auto"
            src="/images/croix-rouge.png"
            alt=""
            srcSet=""
          />
        );
        break;
      default:
        return null;
    }
  }

  if (loading) {
    return <Loader />;
  } else {
    return (
      <div className="bg-[url('/BG.jpeg')] ">
        <NavBarAuth />
        {showDelegationRequest && taskData?.status === "Todo" && (
          <div
            className="notification text-center bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative"
            role="alert">
            <span className="block sm:inline">
              {userFullName} vous a envoyé une demande de délégation de cette
              tâche.
            </span>
            <div className="mt-2 flex justify-center space-x-2">
              <button
                onClick={handleAccept}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center">
                <FaCheck className="mr-2" />
                Accepter
              </button>
              <button
                onClick={handleDecline}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center">
                <FaTimes className="mr-2" />
                Refuser
              </button>
            </div>
          </div>
        )}
        <div
          style={{ height: "90vh" }}
          className="   mx-auto flex justify-center items-center ">
          <div
            style={{ height: "85vh", width: "98vw" }}
            className="TaskContainer text-black   bg-white rounded-lg  ">
            {windowSize.width < 780 ? (
              <div className=" cursor-pointer text-black flex h-14 rounded-t-lg  border-b-4">
                <p
                  onClick={() => setDetails(false)}
                  className={` font-semibold w-1/2 ${
                    !Details ? "bg-blue-300 text-white " : ""
                  } border-r-2 flex justify-center items-center`}>
                  Descreption
                </p>
                <p
                  onClick={() => setDetails(true)}
                  className={` font-semibold w-1/2 ${
                    Details ? "bg-blue-300 text-white " : ""
                  } border-l-2 flex justify-center items-center`}>
                  Details
                </p>
              </div>
            ) : null}
            <div className="">
              {windowSize.width < 780 ? (
                <div>
                  {!Details ? (
                    <div
                      style={{ height: "75vh", width: "98vw" }}
                      className="bg-white w-full  p-4 overflow-y-auto costumScrollBar ">
                      <span
                        onClick={() => setShowTitle(!ShowTitle)}
                        className="cursor-pointer w-fit flex font-bold text-xl  items-center">
                        {ShowTitle ? (
                          <IoMdArrowDropdown className=" h-6 w-6" />
                        ) : (
                          <IoMdArrowDropright className=" h-6 w-6" />
                        )}{" "}
                        Title :
                      </span>
                      {ShowTitle ? (
                        <span className="font-bold text-xl flex">
                          {taskData.Name}
                        </span>
                      ) : null}

                      <span
                        onClick={() => setShowDescription(!ShowDescription)}
                        className="cursor-pointer w-fit flex font-bold text-xl my-2 items-center">
                        {ShowDescription ? (
                          <IoMdArrowDropdown className="h-6 w-6" />
                        ) : (
                          <IoMdArrowDropright className="h-6 w-6" />
                        )}{" "}
                        Description :
                      </span>

                      {ShowDescription ? (
                        <div className="">
                          {showMore
                            ? taskData?.Description
                            : `${taskData.Description?.substring(0, 250)}`}
                          {showMore && (
                            <div className="my-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {taskData?.documents.map((document, index) => (
                                <div
                                  key={index}
                                  className="text-black border-2 flex flex-col justify-between items-center"
                                >
                                  <div className="overflow-hidden sm:h-32 h-20 w-full">
                                    <iframe
                                      src={`http://localhost:1937/uploads/${document}`}
                                      className="w-full h-full"
                                      frameBorder="0"
                                    />
                                  </div>
                                  <div className="px-2 py-2 border-t-2 w-full flex justify-between items-center">
                                    <p className="w-8/12 whitespace-nowrap overflow-hidden overflow-ellipsis">
                                      {document}
                                    </p>
                                    <div className="flex">
                                      <FaCircleDown
                                        onClick={() => handleDownload(`http://localhost:1937/uploads/${document}`)}
                                        className="text-black hover:text-blue-400 download w-6 h-6 cursor-pointer mr-2"
                                      />
                                      {userRole === 'prjctBoss' && (
                                        <FaTrash
                                          onClick={() => handleDeleteDocument(document)}
                                          className="text-red-500 hover:text-red-700 w-6 h-6 cursor-pointer"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            className="btn"
                            onClick={() => setShowMore(!showMore)}>
                            {showMore ? "" : "..."}
                            <span className="text-sm text-blue-600">
                              {showMore ? "Show less" : "Show more"}
                            </span>
                          </button>
                        </div>
                      ) : null}
                      <div></div>
                      <div className="mb-4">
                        <span
                          onClick={() => setShowComments(!ShowComments)}
                          className="cursor-pointer w-fit flex font-bold text-xl my-2 items-center">
                          {ShowComments ? (
                            <IoMdArrowDropdown className=" h-6 w-6" />
                          ) : (
                            <IoMdArrowDropright className=" h-6 w-6" />
                          )}{" "}
                          Commentaires :
                        </span>
                        {/* <h3 className="text-xl font-bold my-2">Commentaires</h3> */}
                        {ShowComments ? (
                          <div>
                            {userRole !== "orgBoss" && userRole !== "" ? (
                              <Formik
                                initialValues={{ comment: "" }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { resetForm }) =>
                                  handleAddComment(
                                    values,
                                    resetForm,
                                    taskData,
                                    userInfo?._id
                                  )
                                }>
                                {({ errors, touched }) => (
                                  <Form>
                                    <div className="relative  mb-4">
                                      <Field
                                        as="textarea"
                                        name="comment"
                                        type="text"
                                        rows={4} // Number of visible rows
                                        cols={50} // Number of visible columns
                                        className={`h-24 w-full border ${
                                          errors.comment && touched.comment
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        } flex justify-start rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Ajouter un commentaire"
                                      />
                                      <button
                                        type="submit"
                                        className="absolute bottom-1 right-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none">
                                        <FaPaperPlane />
                                      </button>
                                    </div>
                                    {errors.comment && touched.comment && (
                                      <div className="text-red-500 mb-4">
                                        {errors.comment}
                                      </div>
                                    )}
                                  </Form>
                                )}
                              </Formik>
                            ) : null}
                            {comments.length > 0 ? (
                              <ul className="">
                                {comments.map((comment, index) => (
                                  <li
                                    key={index}
                                    className="bg-gray-100 rounded-md p-2 mb-2 last:mb-0 flex items-center">
                                    <button className="h-10 w-10 text-xl mr-2 relative flex justify-center items-center rounded-full bg-orange-800  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                      {comment?.authorId?.prenom[0].toUpperCase()}
                                      {comment?.authorId?.nom[0].toUpperCase()}
                                    </button>
                                    <div>
                                      <p className="text-gray-600 font-semibold">
                                        {comment?.authorId?.nom}{" "}
                                        {comment?.authorId?.prenom}{" "}
                                        <span className="text-gray-500 font-normal">
                                          (
                                          {convertDateFormat(
                                            comment?.createdAt
                                          )}
                                          )
                                        </span>
                                      </p>
                                      <p className="text-gray-600">
                                        {comment?.content}
                                      </p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="w-full my-4 py-2 text-gray-00 flex justify-center items-center border-gray-600 border-2 border-dashed">
                                Aucun commentaire pour le moment.
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ height: "75vh", width: "98vw" }}
                      className=" w-full bg-white p-2 overflow-y-auto costumScrollBar">
                      <div className="flex justify-between items-center">
                        <Menu as="div" className=" relative w-min ">
                          <div>
                            <Menu.Button
                              style={{ height: "7vh" }}
                              className="h-full w-full flex justify-center items-center px-1 rounded-xl bg-blue-700 text-sm">
                              <div className="whitespace-nowrap px-4 py-2 text-sm text-white flex justify-start items-center">
                                {getIcon(taskData?.status?.toLowerCase())}
                                <span className="mx-2">
                                  {transformStatus(taskData?.status)}
                                </span>
                              </div>
                              <MdArrowDropDown
                                color="white"
                                className="h-6 w-6"
                              />
                            </Menu.Button>
                          </div>
                          {((userRole === "employee" &&
                            userInfo?._id === taskData?.affectedto._id) ||
                            userRole === "teamBoss") &&
                            taskData?.status !== "Cancel" && (
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="cursor-pointer absolute left-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  {userRole === "teamBoss" &&
                                    taskData?.status === "Inreview" && (
                                      <Menu.Item>
                                        {({ active }) => (
                                          <div
                                            onClick={() =>
                                              patchTaskStatus("Todo")
                                            }
                                            className={classNames(
                                              active ? "bg-blue-300" : "",
                                              "px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                            )}>
                                            <img
                                              className="w-6 h-6 mr-2"
                                              src="/images/list.png"
                                              alt=""
                                            />
                                            To Do
                                          </div>
                                        )}
                                      </Menu.Item>
                                    )}
                                  {userRole === "employee" &&
                                    taskData?.status === "Todo" && (
                                      <Menu.Item>
                                        {({ active }) => (
                                          <div
                                            onClick={() =>
                                              patchTaskStatus("Inprogress")
                                            }
                                            className={classNames(
                                              active ? "bg-blue-300" : "",
                                              " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                            )}>
                                            <img
                                              className="w-6 h-6 mr-2"
                                              src="/images/development.png"
                                              alt=""
                                              srcset=""
                                            />{" "}
                                            In Progress
                                          </div>
                                        )}
                                      </Menu.Item>
                                    )}
                                  {userRole === "employee" &&
                                    taskData?.status === "Inprogress" && (
                                      <Menu.Item>
                                        {({ active }) => (
                                          <div
                                            onClick={() =>
                                              patchTaskStatus("Inreview")
                                            }
                                            className={classNames(
                                              active ? "bg-blue-300" : "",
                                              " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                            )}>
                                            <img
                                              className="w-6 h-6 mr-2"
                                              src="/images/code-review.png"
                                              alt=""
                                              srcset=""
                                            />{" "}
                                            In Review
                                          </div>
                                        )}
                                      </Menu.Item>
                                    )}
                                  {userRole === "teamBoss" &&
                                    taskData?.status === "Inreview" && (
                                      <Menu.Item>
                                        {({ active }) => (
                                          <div
                                            onClick={() =>
                                              patchTaskStatus("Done")
                                            }
                                            className={classNames(
                                              active ? "bg-blue-300" : "",
                                              " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                            )}>
                                            <img
                                              className="w-6 h-6 mr-2"
                                              src="/images/checkbox.png"
                                              alt=""
                                              srcset=""
                                            />{" "}
                                            Done
                                          </div>
                                        )}
                                      </Menu.Item>
                                    )}
                                  {userRole === "teamBoss" && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <div
                                          onClick={() => setShowPopUp(true)}
                                          className={classNames(
                                            active ? "bg-blue-300" : "",
                                            " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                          )}>
                                          <img
                                            className="w-6 h-6 mr-2"
                                            src="/images/croix-rouge.png"
                                            alt=""
                                            srcset=""
                                          />{" "}
                                          Canceled
                                        </div>
                                      )}
                                    </Menu.Item>
                                  )}
                                </Menu.Items>
                              </Transition>
                            )}
                        </Menu>
                        {userRole === "employee" &&
                        taskData?.affectedto?._id === userInfo?._id &&
                        (taskData?.priorite === "D" ||
                          taskData?.priorite === "E") &&
                        taskData?.status === "Todo" ? (
                          <FaShare
                            onClick={() => setShowShareModal(true)}
                            className="h-6 w-6 cursor-pointer text-blue-500 hover:text-blue-600 hover:transform hover:scale-110"
                          />
                        ) : null}
                      </div>
                      <div
                        onClick={() => setShowDetails(!ShowDetails)}
                        className={`mt-2 ${
                          ShowDetails ? "rounded-t-md" : "rounded-md"
                        }  px-4 py-2 flex justify-between border-t-2 ${
                          ShowDetails ? "" : "border-b-2"
                        } border-r-2 border-l-2 w-full  cursor-pointer`}>
                        <span>Details</span>
                        <MdArrowDropDown className="h-6 w-6 " />
                      </div>
                      {ShowDetails ? (
                        <div className="p-4 border-2 rounded-b-md w-full ">
                          <div className="my-2 flex justify-start">
                            <p className="w-6/12">Assignee</p>
                            {Assigned ? (
                              <div className="flex">
                                <button
                                  onClick={() => {
                                    setUserCardInfo(taskData?.affectedto);
                                    setShowUserCard(true);
                                  }}
                                  className="h-8 w-8 text-l mr-2 relative flex justify-center items-center rounded-full bg-orange-800  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                  {taskData?.affectedto.nom[0].toUpperCase()}
                                  {taskData?.affectedto.prenom[0].toUpperCase()}
                                </button>
                                <p>
                                  {taskData?.affectedto.nom}{" "}
                                  {taskData?.affectedto.prenom}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <div className="flex">
                                  <FaUserCircle className=" rounded-full w-6 h-6 mr-2" />
                                  <p>
                                    {taskData?.affectedto
                                      ? `${taskData?.affectedto.nom} ${taskData?.affectedto.prenom}`
                                      : "Unassigned"}
                                  </p>
                                </div>
                                {!showAssigneeModal ? (userRole === "teamBoss" && taskData?.team.Boss === userInfo?._id) && (
                                  <p
                                    onClick={() => setShowAssigneeModal(true)}
                                    className=" flex justify-center items-center px-1 rounded-xl text-blue-700 hover:underline cursor-pointer text-sm     ">
                                    Assign it
                                  </p>
                                ) : (
                                  <p
                                    onClick={() => setShowAssigneeModal(false)}
                                    className=" flex justify-center items-center px-1 rounded-xl text-blue-700 hover:underline cursor-pointer text-sm     ">
                                    Close
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              width: "100vw",
                              height: "100vh",
                              backdropFilter: "blur(2px)",
                              backgroundColor: "rgba(255, 255, 255, 0)",
                            }}
                            className={` fixed inset-0 z-50  overflow-y-auto justify-center items-center flex     ${
                              showAssigneeModal
                                ? "opacity-100 visible"
                                : "opacity-0 invisible"
                            } `}>
                            <div className="myShadow sm:w-[60vw] w-[90vw] h-[90vh] relative mx-auto   rounded-lg shadow-md bg-white">
                              <div className="h-[10vh] flex justify-between items-center px-5 border-b border-gray-200">
                                <span className="text-black font-semibold text-2xl">
                                  Assign task
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowAssigneeModal(false)}
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

                              {teamMembres?.map((person, index) => (
                                <div
                                  key={index}
                                  className="border-b-2 border-gray-400   w-full  my-2 rounded-xl flex justify-between items-center p-2    ">
                                  <div className="flex ">
                                    <div className="  flex flex-col justify-center  items-center text-sm font-semibold text-gray-800 ">
                                      <button className="h-8 w-8 relative flex justify-center items-center rounded-full bg-orange-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                        {person.nom[0].toUpperCase()}{" "}
                                        {person.prenom[0].toUpperCase()}
                                      </button>
                                    </div>
                                    <div className=" flex flex-col justify-center ml-4">
                                      <div className="truncate  text-sm text-gray-600 ">
                                        {person.nom} {person.prenom}
                                      </div>
                                      <div
                                        className={`truncate  text-gray-800 font-semibold  text-sm `}>
                                        {person.email}{" "}
                                      </div>
                                    </div>
                                  </div>

                                  <div className=" flex justify-center items-center">
                                    {!Assigned ? (
                                      <button
                                        type="button"
                                        className="text-gray-600  hover:text-blue-500 focus:outline-none "
                                        onClick={() => assignTask(person)}>
                                        {/* <FaTrash className="mr-1" /> */}
                                        Assign to
                                      </button>
                                    ) : (
                                      <GrValidate className="mr-1 h-6 w-6 text-green-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="my-2 flex justify-start items-center">
                            <p className="w-6/12">Team </p>{" "}
                            <p>{taskData?.team?.Name}</p>
                          </div>
                          <div className="my-2 flex justify-start items-center">
                            <p className="w-6/12">Priority </p>{" "}
                            <p
                              style={{
                                backgroundColor: getColor(taskData?.priorite),
                              }}
                              className={`text-white flex justify-center items-center w-10 h-10 rounded-full`}>
                              {taskData?.priorite}
                            </p>
                          </div>

                          <div className="my-2 flex justify-start">
                            <p className="w-6/12">Must start : </p>{" "}
                            <p>
                              {taskData?.dateDebutEstim
                                ? new Date(taskData?.dateDebutEstim)
                                    .toISOString()
                                    .split("T")[0]
                                : ""}
                            </p>
                          </div>
                          <div className="my-2 flex justify-start">
                            <p className="w-6/12">Must end : </p>{" "}
                            <p>
                              {taskData?.dateFinEstim
                                ? new Date(taskData?.dateFinEstim)
                                    .toISOString()
                                    .split("T")[0]
                                : ""}
                            </p>
                          </div>
                          <div className="my-2 flex justify-start">
                            <p className="w-6/12">Start Date : </p>{" "}
                            <p>
                              {taskData?.dateDebutReel
                                ? new Date(taskData?.dateDebutReel)
                                    .toISOString()
                                    .split("T")[0]
                                : "Not yet"}
                            </p>
                          </div>
                          <div className="my-2 flex justify-start">
                            <p className="w-6/12">End Date : </p>{" "}
                            <p>
                              {taskData?.dateFinReel
                                ? new Date(taskData?.dateFinReel)
                                    .toISOString()
                                    .split("T")[0]
                                : "Not yet"}
                            </p>
                          </div>
                          <div className="my-2 flex justify-start">
                            <p className="w-6/12">Project : </p>{" "}
                            <p>{taskData?.projet?.Name}</p>
                          </div>
                        </div>
                      ) : null}
                      {userRole === "prjctBoss" ? (
                        <div className="flex justify-end px-2 py-1">
                          <div
                            onClick={handleShowUpdateTaskForm}
                            className="flex justify-center items-center mx-2 underline text-blue-700 cursor-pointer hover:no-underline ">
                            <MdEditDocument className="h-5 w-5 mr-1" />
                            <p>Edit</p>
                          </div>
                        </div>
                      ) : null}
                      {showPopUp ? (
                        <div className="text-white fixed inset-0 flex items-center justify-center z-50">
                          <div className="bg-gray-700 rounded-lg shadow-lg p-6 relative">
                            <button
                              type="button"
                              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                              onClick={() => setShowPopUp(false)}>
                              <FaTimes color="white" />
                            </button>
                            <div className="mb-4 text-lg font-semibold">
                              Confirmation
                            </div>
                            <div className="mb-4">
                              Êtes-vous sûr de vouloir annuler cette tâche ?
                            </div>
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
                                onClick={() => setShowPopUp(false)}>
                                Annuler
                              </button>
                              <button
                                type="button"
                                className="bg-[#fc4545] text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600"
                                onClick={() => {
                                  patchTaskStatus("Cancel");
                                  setShowPopUp(false);
                                }}>
                                Oui
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{ height: "85vh", width: "98vw" }}
                  className="TaskContainer flex overflow-hidden px-8 pt-8  rounded-lg">
                  <div className="bg-white w-9/12 lg:w-8/12 p-4 overflow-y-auto costumScrollBar ">
                    <span
                      onClick={() => setShowTitle(!ShowTitle)}
                      className="cursor-pointer w-fit flex font-bold text-xl  items-center">
                      {ShowTitle ? (
                        <IoMdArrowDropdown className=" h-6 w-6" />
                      ) : (
                        <IoMdArrowDropright className=" h-6 w-6" />
                      )}{" "}
                      Title :
                    </span>
                    {ShowTitle ? (
                      <span className="font-bold text-xl flex">
                        {taskData?.Name}
                      </span>
                    ) : null}

                    <span
                      onClick={() => setShowDescription(!ShowDescription)}
                      className="cursor-pointer w-fit flex font-bold text-xl my-2 items-center">
                      {ShowDescription ? (
                        <IoMdArrowDropdown className="h-6 w-6" />
                      ) : (
                        <IoMdArrowDropright className="h-6 w-6" />
                      )}{" "}
                      Description :
                    </span>

                    {ShowDescription ? (
                      <div className="">
                        {showMore
                          ? taskData?.Description
                          : `${taskData?.Description?.substring(0, 250)}`}
                        {showMore && (
                            <div className="my-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {taskData?.documents.map((document, index) => (
                                <div
                                  key={index}
                                  className="text-black border-2 flex flex-col justify-between items-center"
                                >
                                  <div className="overflow-hidden sm:h-32 h-20 w-full">
                                    <iframe
                                      src={`http://localhost:1937/uploads/${document}`}
                                      className="w-full h-full"
                                      frameBorder="0"
                                    />
                                  </div>
                                  <div className="px-2 py-2 border-t-2 w-full flex justify-between items-center">
                                    <p className="w-8/12 whitespace-nowrap overflow-hidden overflow-ellipsis">
                                      {document}
                                    </p>
                                    <div className="flex">
                                      <FaCircleDown
                                        onClick={() => handleDownload(`http://localhost:1937/uploads/${document}`)}
                                        className="text-black hover:text-blue-400 download w-6 h-6 cursor-pointer mr-2"
                                      />
                                      {userRole === 'prjctBoss' && (
                                        <FaTrash
                                          onClick={() => handleDeleteDocument(document)}
                                          className="text-red-500 hover:text-red-700 w-6 h-6 cursor-pointer"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        <button
                          className="btn"
                          onClick={() => setShowMore(!showMore)}>
                          {showMore ? "" : "..."}
                          <span className="text-sm text-blue-600">
                            {showMore ? "Show less" : "Show more"}
                          </span>
                        </button>
                      </div>
                    ) : null}
                    <div></div>
                    <div className="mb-4">
                      <span
                        onClick={() => setShowComments(!ShowComments)}
                        className="cursor-pointer w-fit flex font-bold text-xl my-2 items-center">
                        {ShowComments ? (
                          <IoMdArrowDropdown className=" h-6 w-6" />
                        ) : (
                          <IoMdArrowDropright className=" h-6 w-6" />
                        )}{" "}
                        Commentaires :
                      </span>
                      {/* <h3 className="text-xl font-bold my-2">Commentaires</h3> */}
                      {ShowComments ? (
                        <div>
                          {userRole !== "orgBoss" && userRole !== "" ? (
                            <Formik
                              initialValues={{ comment: "" }}
                              validationSchema={validationSchema}
                              onSubmit={(values, { resetForm }) =>
                                handleAddComment(
                                  values,
                                  resetForm,
                                  taskData,
                                  userInfo?._id
                                )
                              }>
                              {({ errors, touched }) => (
                                <Form>
                                  <div className="relative  mb-4">
                                    <Field
                                      as="textarea"
                                      name="comment"
                                      type="text"
                                      rows={4} // Number of visible rows
                                      cols={50} // Number of visible columns
                                      className={`h-24 w-full border ${
                                        errors.comment && touched.comment
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } flex justify-start rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                      placeholder="Ajouter un commentaire"
                                    />
                                    <button
                                      type="submit"
                                      className="absolute bottom-1 right-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none">
                                      <FaPaperPlane />
                                    </button>
                                  </div>
                                  {errors.comment && touched.comment && (
                                    <div className="text-red-500 mb-4">
                                      {errors.comment}
                                    </div>
                                  )}
                                </Form>
                              )}
                            </Formik>
                          ) : null}
                          {comments.length > 0 ? (
                            <ul className="">
                              {comments.map((comment, index) => (
                                <li
                                  key={index}
                                  className="bg-gray-100 rounded-md p-2 mb-2 last:mb-0 flex items-center">
                                  <button className="h-10 w-10 text-xl mr-2 relative flex justify-center items-center rounded-full bg-orange-800  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                    {comment?.authorId?.prenom[0].toUpperCase()}
                                    {comment?.authorId?.nom[0].toUpperCase()}
                                  </button>
                                  <div>
                                    <p className="text-gray-600 font-semibold">
                                      {comment?.authorId?.nom}{" "}
                                      {comment?.authorId?.prenom}{" "}
                                      <span className="text-gray-500 font-normal">
                                        ({convertDateFormat(comment?.createdAt)}
                                        )
                                      </span>
                                    </p>
                                    <p className="text-gray-600">
                                      {comment?.content}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="w-full my-4 py-2 text-gray-00 flex justify-center items-center border-gray-600 border-2 border-dashed">
                              Aucun commentaire pour le moment.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className=" w-5/12 lg:w-4/12 bg-white p-2 overflow-y-auto costumScrollBar">
                    <div className="flex justify-between items-center">
                      <Menu as="div" className=" relative w-min ">
                        <div>
                          <Menu.Button
                            style={{ height: "7vh" }}
                            className="h-full w-full flex justify-center items-center px-1 rounded-xl bg-blue-700 text-sm">
                            <div className="whitespace-nowrap px-4 py-2 text-sm text-white flex justify-start items-center">
                              {getIcon(taskData?.status?.toLowerCase())}
                              <span className="mx-2">
                                {transformStatus(taskData?.status)}
                              </span>
                            </div>
                            <MdArrowDropDown
                              color="white"
                              className="h-6 w-6"
                            />
                          </Menu.Button>
                        </div>
                        {((userRole === "employee" &&
                          userInfo?._id === taskData?.affectedto?._id) ||
                          userRole === "teamBoss") &&
                          taskData?.status !== "Cancel" && (
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95">
                              <Menu.Items className="cursor-pointer absolute left-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {userRole === "teamBoss" &&
                                  taskData?.status === "Inreview" && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <div
                                          onClick={() =>
                                            patchTaskStatus("Todo")
                                          }
                                          className={classNames(
                                            active ? "bg-blue-300" : "",
                                            "px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                          )}>
                                          <img
                                            className="w-6 h-6 mr-2"
                                            src="/images/list.png"
                                            alt=""
                                          />
                                          To Do
                                        </div>
                                      )}
                                    </Menu.Item>
                                  )}
                                {userRole === "employee" &&
                                  taskData?.status === "Todo" && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <div
                                          onClick={() =>
                                            patchTaskStatus("Inprogress")
                                          }
                                          className={classNames(
                                            active ? "bg-blue-300" : "",
                                            " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                          )}>
                                          <img
                                            className="w-6 h-6 mr-2"
                                            src="/images/development.png"
                                            alt=""
                                            srcset=""
                                          />{" "}
                                          In Progress
                                        </div>
                                      )}
                                    </Menu.Item>
                                  )}
                                {userRole === "employee" &&
                                  taskData?.status === "Inprogress" && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <div
                                          onClick={() =>
                                            patchTaskStatus("Inreview")
                                          }
                                          className={classNames(
                                            active ? "bg-blue-300" : "",
                                            " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                          )}>
                                          <img
                                            className="w-6 h-6 mr-2"
                                            src="/images/code-review.png"
                                            alt=""
                                            srcset=""
                                          />{" "}
                                          In Review
                                        </div>
                                      )}
                                    </Menu.Item>
                                  )}
                                {userRole === "teamBoss" &&
                                  taskData?.status === "Inreview" && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <div
                                          onClick={() =>
                                            patchTaskStatus("Done")
                                          }
                                          className={classNames(
                                            active ? "bg-blue-300" : "",
                                            " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                          )}>
                                          <img
                                            className="w-6 h-6 mr-2"
                                            src="/images/checkbox.png"
                                            alt=""
                                            srcset=""
                                          />{" "}
                                          Done
                                        </div>
                                      )}
                                    </Menu.Item>
                                  )}
                                {userRole === "teamBoss" && (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <div
                                        onClick={() => setShowPopUp(true)}
                                        className={classNames(
                                          active ? "bg-blue-300" : "",
                                          " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                                        )}>
                                        <img
                                          className="w-6 h-6 mr-2"
                                          src="/images/croix-rouge.png"
                                          alt=""
                                          srcset=""
                                        />{" "}
                                        Canceled
                                      </div>
                                    )}
                                  </Menu.Item>
                                )}
                              </Menu.Items>
                            </Transition>
                          )}
                      </Menu>
                      {userRole === "employee" &&
                      taskData?.affectedto?._id === userInfo?._id &&
                      (taskData?.priorite === "D" ||
                        taskData?.priorite === "E") &&
                      taskData?.status === "Todo" ? (
                        <FaShare
                          onClick={() => setShowShareModal(true)}
                          className="h-6 w-6 cursor-pointer text-blue-500 hover:text-blue-600 hover:transform hover:scale-110"
                        />
                      ) : null}
                    </div>
                    <div
                      onClick={() => setShowDetails(!ShowDetails)}
                      className={`mt-2 ${
                        ShowDetails ? "rounded-t-md" : "rounded-md"
                      }  px-4 py-2 flex justify-between border-t-2 ${
                        ShowDetails ? "" : "border-b-2"
                      } border-r-2 border-l-2 w-full  cursor-pointer`}>
                      <span>Details</span>
                      <MdArrowDropDown className="h-6 w-6 " />
                    </div>
                    {ShowDetails ? (
                      <div className=" p-4 border-2 rounded-b-md w-full relative">
                        <div className=" relative my-2 flex justify-start">
                          <p className="w-6/12">Assignee</p>
                          {Assigned ? (
                            <div className="flex">
                              <button
                                onClick={() => {
                                  setUserCardInfo(taskData?.affectedto);
                                  setShowUserCard(true);
                                }}
                                className="h-8 w-8 text-l mr-2 relative flex justify-center items-center rounded-full bg-orange-800  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                {taskData?.affectedto.nom[0].toUpperCase()}
                                {taskData?.affectedto.prenom[0].toUpperCase()}
                              </button>
                              <p>
                                {taskData?.affectedto?.nom}{" "}
                                {taskData?.affectedto?.prenom}
                              </p>
                            </div>
                          ) : (
                            <div className="">
                              <div className="flex ">
                                <FaUserCircle className=" rounded-full w-6 h-6 mr-2" />
                                <p>
                                  {taskData?.affectedto
                                    ? `${taskData?.affectedto?.nom} ${taskData?.affectedto?.prenom}`
                                    : "Unassigned"}
                                </p>
                              </div>
                              {!showAssigneeModal ? (userRole === "teamBoss" && taskData?.team?.Boss === userInfo?._id) && (
                                
                                <p
                                  onClick={() => setShowAssigneeModal(true)}
                                  className=" flex justify-center items-center px-1 rounded-xl text-blue-700 hover:underline cursor-pointer text-sm     ">
                                  Assign it
                                </p>
                              ) : (
                                <p
                                  onClick={() => setShowAssigneeModal(false)}
                                  className=" flex justify-center items-center px-1 rounded-xl text-blue-700 hover:underline cursor-pointer text-sm     ">
                                  Close
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            width: "100vw",
                            height: "100vh",
                            backdropFilter: "blur(2px)",
                            backgroundColor: "rgba(255, 255, 255, 0)",
                          }}
                          className={` fixed inset-0 z-50  overflow-y-auto justify-center items-center flex     ${
                            showAssigneeModal
                              ? "opacity-100 visible"
                              : "opacity-0 invisible"
                          } `}>
                          <div className="myShadow sm:w-[60vw] w-[90vw] h-[90vh] relative mx-auto   rounded-lg shadow-md bg-white">
                            <div className="h-[10vh] flex justify-between items-center px-5 border-b border-gray-200">
                              <span className="text-black font-semibold text-2xl">
                                Assign task
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowAssigneeModal(false)}
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
                            {teamMembres?.map((person, index) => (
                              <div
                                key={index}
                                className="border-b-2 border-gray-400   w-full  my-2 rounded-xl flex justify-between items-center p-2    ">
                                <div className="flex ">
                                  <div className="  flex flex-col justify-center  items-center text-sm font-semibold text-gray-800 ">
                                    <button
                                      onClick={() => {
                                        setUserCardInfo(person);
                                        setShowUserCard(true);
                                      }}
                                      className="h-8 w-8 relative flex justify-center items-center rounded-full bg-orange-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                      {person.nom[0].toUpperCase()}{" "}
                                      {person.prenom[0].toUpperCase()}
                                    </button>
                                  </div>
                                  <div className=" flex flex-col justify-center ml-4">
                                    <div className="truncate  text-sm text-gray-600 ">
                                      {person.nom} {person.prenom}
                                    </div>
                                    <div
                                      className={`truncate  text-gray-800 font-semibold  text-sm `}>
                                      {person.email}{" "}
                                    </div>
                                  </div>
                                </div>

                                <div className=" flex justify-center items-center">
                                  {!Assigned ? (
                                    <button
                                      type="button"
                                      className="text-gray-600  hover:text-blue-500 focus:outline-none "
                                      onClick={() => assignTask(person)}>
                                      {/* <FaTrash className="mr-1" /> */}
                                      Assign to
                                    </button>
                                  ) : (
                                    <GrValidate className="mr-1 h-6 w-6 text-green-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="my-2 flex justify-start items-center">
                          <p className="w-6/12">Team </p>{" "}
                          <p>{taskData?.team?.Name}</p>
                        </div>
                        <div className="my-2 flex justify-start items-center">
                          <p className="w-6/12">Priority </p>{" "}
                          <p
                            style={{
                              backgroundColor: getColor(taskData?.priorite),
                            }}
                            className={`text-white flex justify-center items-center w-10 h-10 rounded-full`}>
                            {taskData?.priorite}
                          </p>
                        </div>

                        <div className="my-2 flex justify-start">
                          <p className="w-6/12">Must start : </p>{" "}
                          <p>
                            {taskData?.dateDebutEstim
                              ? new Date(taskData?.dateDebutEstim)
                                  .toISOString()
                                  .split("T")[0]
                              : ""}
                          </p>
                        </div>
                        <div className="my-2 flex justify-start">
                          <p className="w-6/12">Must end : </p>{" "}
                          <p>
                            {taskData?.dateFinEstim
                              ? new Date(taskData?.dateFinEstim)
                                  .toISOString()
                                  .split("T")[0]
                              : ""}
                          </p>
                        </div>
                        <div className="my-2 flex justify-start">
                          <p className="w-6/12">Start Date : </p>{" "}
                          <p>
                            {taskData?.dateDebutReel
                              ? new Date(taskData?.dateDebutReel)
                                  .toISOString()
                                  .split("T")[0]
                              : "Not yet"}
                          </p>
                        </div>
                        <div className="my-2 flex justify-start">
                          <p className="w-6/12">End Date : </p>{" "}
                          <p>
                            {taskData?.dateFinReel
                              ? new Date(taskData?.dateFinReel)
                                  .toISOString()
                                  .split("T")[0]
                              : "Not yet"}
                          </p>
                        </div>
                        <div className="my-2 flex justify-start">
                          <p className="w-6/12">Project : </p>{" "}
                          <p>{taskData?.projet?.Name}</p>
                        </div>
                      </div>
                    ) : null}
                    {userRole === "prjctBoss" ? (
                      <div className="flex justify-end px-2 py-1">
                        <div
                          onClick={handleShowUpdateTaskForm}
                          className="flex justify-center items-center mx-2 underline text-blue-700 cursor-pointer hover:no-underline ">
                          <MdEditDocument className="h-5 w-5 mr-1" />
                          <p>Edit</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {showPopUp ? (
                    <div className="text-white fixed inset-0 flex items-center justify-center z-50">
                      <div className="bg-gray-700 rounded-lg shadow-lg p-6 relative">
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                          onClick={() => setShowPopUp(false)}>
                          <FaTimes color="white" />
                        </button>
                        <div className="mb-4 text-lg font-semibold">
                          Confirmation
                        </div>
                        <div className="mb-4">
                          Êtes-vous sûr de vouloir annuler cette tâche ?
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
                            onClick={() => setShowPopUp(false)}>
                            Annuler
                          </button>
                          <button
                            type="button"
                            className="bg-[#fc4545] text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600"
                            onClick={() => {
                              patchTaskStatus("Cancel");
                              setShowPopUp(false);
                            }}>
                            Oui
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100vw",
            height: "100vh",
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(255, 255, 255, 0)",
          }}
          className={` fixed inset-0 z-50  overflow-y-auto justify-center items-center flex     ${
            ShowShareModal ? "opacity-100 visible" : "opacity-0 invisible"
          } `}>
          <div className="myShadow sm:w-[60vw] w-[90vw] h-[90vh] relative mx-auto   rounded-lg shadow-md bg-white">
            <div className="h-[10vh] flex justify-between items-center px-5 border-b border-gray-200">
              <span className="text-black font-semibold text-2xl">
                Share task
              </span>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
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
            <div className="px-2 w-full h-[80vh] overflow-auto costumScrollBar">
              {teamMembres?.map(
                (person, index) =>
                  person._id !== userInfo._id && (
                    <div
                      key={index}
                      className="border-b-2 border-gray-400 w-full my-2 rounded-xl flex justify-between items-center p-2">
                      <div className="flex">
                        <div className="flex flex-col justify-center items-center text-sm font-semibold text-gray-800">
                          <button className="h-8 w-8 relative flex justify-center items-center rounded-full bg-orange-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            {person.nom[0].toUpperCase()}{" "}
                            {person.prenom[0].toUpperCase()}
                          </button>
                        </div>
                        <div className="flex flex-col justify-center ml-4">
                          <div className="truncate text-sm text-gray-600">
                            {person.nom} {person.prenom}
                          </div>
                          <div className="truncate text-gray-800 font-semibold text-sm">
                            {person.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center items-center">
                        {delegationStatus[person._id] === undefined ? (
                          <span>Chargement...</span>
                        ) : delegationStatus[person._id] ? (
                          <GrValidate className="mr-1 h-6 w-6 text-green-500" />
                        ) : (
                          <button
                            type="button"
                            className="text-gray-600 hover:text-blue-500 focus:outline-none"
                            onClick={() => delegatedTask(person)}>
                            Delegate to
                          </button>
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            width: "100vw",
            height: "100vh",
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(255, 255, 255, 0)",
          }}
          className={` fixed inset-0 z-50  overflow-y-auto justify-center items-center flex     ${
            updateIssueModal ? "opacity-100 visible" : "opacity-0 invisible"
          } `}>
          <div
            style={{ width: "90vw", height: "90vh" }}
            className="myShadow relative mx-auto   rounded-lg shadow-md bg-white">
            <div className="flex justify-between items-center px-5 border-b border-gray-200">
              <h3
                style={{ height: "10vh" }}
                className="text-xl sm:text-3xl font-medium text-gray-900 flex items-center">
                Update Issue{" "}
              </h3>

              <button
                type="button"
                onClick={handleCachUpdateTaskForm}
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
              style={{
                display: "flex",
                justifyContent: "center", // Centers the items horizontally
                height: "78vh",
                overflowY: "auto", // Enables vertical scrollbar if needed
              }}
              className="p-6 costumScrollBar overflow-y-auto">
              {updateIssueModal && showUpdateTaskForm ? (
                <UpdateTaskForm
                  task={taskData}
                  organization={organization && organization}
                  handleCachUpdateTaskForm={handleCachUpdateTaskForm}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* user card modal */}
        {showUserCard ? (
          <UserCard
            organization={organization}
            teamId={taskData?.team?._id}
            userCardInfo={userCardInfo}
            showUserCard={showUserCard}
            setShowUserCard={setShowUserCard}
          />
        ) : null}
      </div>
    );
  }
};

export default ProtectedRoute(TaskPage);
