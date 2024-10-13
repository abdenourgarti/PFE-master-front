"use client";
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
  FaTasks,
  FaClock,
  FaClipboardCheck,
  FaTrash,
} from "react-icons/fa";
// import { FaExclamationCircle } from "react-icons/fa";
import axios from "axios";

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
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { pdfjs, Document, Page } from "react-pdf";
import { GrValidate } from "react-icons/gr";
import ProgressCircle from "@/components/Employee/components/ProgressCercle";
import UpdateProjectForm from "../../UpdateProjectForm";

const ProjectDetails = ({ project, reloadpage, reload }) => {
  const axiosInstance = axios.create({
    baseURL: "http://localhost:1937",
    headers: {
      "Content-Type": "application/json",
    },
  });
  let text =
    "Import trace for requested module:Import trace for requestedmodule: Import trace for requested module:Import trace forrequested module:Import trace for requested module:Import tracefor requested module:Import trace for requested module:Importtrace for requested module:Import trace for requestedmodule:Import trace for requested module:Import trace forrequested module:Import trace for requested module:";
  const [ShowDescription, setShowDescription] = useState(true);
  const [ShowTitle, setShowTitle] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);
  // <<<<<<< HEAD
  const [doneTasks, setDoneTasks] = useState([]);
  const [todoTasks, setTodoTasks] = useState([]);
  const [inreviewTasks, setInreviewTasks] = useState([]);
  const [inprogressTasks, setInprogressTasks] = useState([]);
  // =======
  // const [doneTasks, setDoneTasks] = useState(0);
  const [cancelTasks, setCancelTasks] = useState(0);
  // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
  const [updateProjectModal, setUpdateProjectModal] = useState(false);
  const [showUpdateProjectForm, setShowUpdateProjectForm] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  const handleCachUpdateProjectForm = () => {
    setUpdateProjectModal(false);
    setShowUpdateProjectForm(false);
  };
  const handleShowUpdateProjectForm = () => {
    setUpdateProjectModal(true);
    setShowUpdateProjectForm(true);
  };

  const onDocumentLoadSuccess = ({ nextNumPages }) => {
    setNumPages(nextNumPages);
  };

  const handleDeleteDocument = async (documentName) => {
    try {
      const response = await axiosInstance.patch(
        `/project/deleteDocument/${project?._id}`,
        {
          fileName: documentName,
        }
      );
      console.log(`Deleting document: ${documentName}`);
      reloadpage();
    } catch (error) {}
  };

  const [pastDueTasks, setPastDueTasks] = useState(0);
  useEffect(() => {
    console.log(JSON.stringify(project.tasks));
    setDoneTasks(project.tasks.filter((task) => task.status === "Done"));
    // <<<<<<< HEAD
    setTodoTasks(project.tasks.filter((task) => task.status === "Todo"));
    setInreviewTasks(
      project.tasks.filter((task) => task.status === "Inreview")
    );
    setInprogressTasks(
      project.tasks.filter((task) => task.status === "Inprogress")
    );
    const currentDate = new Date();
    const count = project.tasks.filter(
      (task) =>
        new Date(task.dateFinEstim) < currentDate && task.status !== "Done"
    ).length;
    setPastDueTasks(count);
    // =======
    setCancelTasks(project.tasks.filter((task) => task.status === "Cancel"));
    // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
  }, [project]);

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
  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      console.error("URL du fichier non disponible");
    }
  };
  const [isOverdue, setisOverdue] = useState(false);

  return (
    <div className=" flex w-full">
      <div className="bg-white flex-grow p-4 costumScrollBar ">
        <div className="flex justify-between items-center">
          <span
            onClick={() => setShowTitle(!ShowTitle)}
            className="cursor-pointer w-fit flex font-bold text-xl items-center">
            {ShowTitle ? (
              <IoMdArrowDropdown className=" h-6 w-6" />
            ) : (
              <IoMdArrowDropright className=" h-6 w-6" />
            )}{" "}
            Title :
          </span>
          {userRole === "orgBoss" && (
            <div
              onClick={handleShowUpdateProjectForm}
              className="flex justify-center items-center mx-2 underline text-blue-700 cursor-pointer hover:no-underline">
              <MdEditDocument className="h-6 w-6 mr-1" />
              <p className="text-2xl">Edit</p>
            </div>
          )}
        </div>
        {ShowTitle ? (
          <span className="font-bold text-xl flex mb-4">{project.Name}</span>
        ) : null}

        <div className="flex flex-row  justify-center min-w-full">
          <div className="flex flex-col sm:flex-row justify-around w-full  bg-gray-100 rounded-lg overflow-hidden  shadow-md">
            <div className="text-center bg-white  w-full sm:w-1/2 py-4 px-2">
              <div className="text-sm font-medium text-gray-600 ">To Do</div>
              <div className="text-2xl font-bold text-blue-600">
                {todoTasks?.length}
              </div>
              <div className="text-sm flex  items-center font-medium text-gray-600 justify-around mt-2 ">
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      todoTasks?.filter((task) => task?.priorite === "A")
                        ?.length
                    }
                  </div>
                  <div className="text-sm font-medium text-gray-600">A</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {todoTasks?.filter((task) => task?.priorite === "B").length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">B</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {todoTasks?.filter((task) => task?.priorite === "C").length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">C</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {todoTasks?.filter((task) => task?.priorite === "D").length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">D</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {todoTasks?.filter((task) => task?.priorite === "E").length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">E</div>
                </div>
              </div>
            </div>
            <div className="text-center bg-slate-400  w-full sm:w-1/2  py-4 px-2">
              <div className="text-sm font-medium text-white">In Progress</div>
              <div className="text-2xl font-bold text-yellow-600">
                {inprogressTasks?.length}
              </div>
              <div className="text-sm flex  items-center font-medium text-gray-600 justify-around mt-2 ">
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inprogressTasks?.filter((task) => task?.priorite === "A")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-white">A</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inprogressTasks?.filter((task) => task?.priorite === "B")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-white">B</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inprogressTasks?.filter((task) => task?.priorite === "C")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-white">C</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inprogressTasks?.filter((task) => task?.priorite === "D")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-white">D</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inprogressTasks?.filter((task) => task?.priorite === "E")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-white">E</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-around  w-full bg-gray-100 rounded-lg overflow-hidden  shadow-md">
            <div className="text-center bg-slate-400 sm:bg-white w-full sm:w-1/2 py-4 px-2">
              <div className="text-sm font-medium text-white sm:text-gray-600">
                In Review
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {inreviewTasks?.length}
              </div>
              <div className="text-sm flex  items-center font-medium text-gray-600 justify-around mt-2 ">
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inreviewTasks?.filter((task) => task?.priorite === "A")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-gray-600">A</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inreviewTasks?.filter((task) => task?.priorite === "B")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-gray-600">B</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inreviewTasks?.filter((task) => task?.priorite === "C")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-gray-600">C</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inreviewTasks?.filter((task) => task?.priorite === "D")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-gray-600">D</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {
                      inreviewTasks?.filter((task) => task?.priorite === "E")
                        .length
                    }
                  </div>
                  <div className="text-sm font-medium text-gray-600">E</div>
                </div>
              </div>
            </div>
            <div className="text-center bg-white sm:bg-slate-400 w-full sm:w-1/2 py-4 px-2">
              <div className="text-sm font-medium text-gray-600 sm:text-white">
                Done
              </div>
              <div className="text-2xl font-bold text-green-600">
                {doneTasks?.length}
              </div>
              <div className="text-sm flex  items-center font-medium text-gray-600 justify-around mt-2 ">
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {doneTasks?.filter((task) => task?.priorite === "A").length}
                  </div>
                  <div className="text-sm font-medium text-white">A</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {doneTasks?.filter((task) => task?.priorite === "B").length}
                  </div>
                  <div className="text-sm font-medium text-white">B</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {doneTasks?.filter((task) => task?.priorite === "C").length}
                  </div>
                  <div className="text-sm font-medium text-white">C</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {doneTasks?.filter((task) => task?.priorite === "D").length}
                  </div>
                  <div className="text-sm font-medium text-white">D</div>
                </div>{" "}
                <div>
                  <div className="text-sm font-bold text-blue-600">
                    {doneTasks?.filter((task) => task?.priorite === "E").length}
                  </div>
                  <div className="text-sm font-medium text-white">E</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-around items-center my-4">
          <div
            className={`px-4 py-3 rounded relative flex items-center space-x-4 ${
              pastDueTasks > 0
                ? "bg-red-100 border border-red-400 text-red-700"
                : "bg-green-100 border border-green-400 text-green-700"
            }`}
            role="alert">
            {pastDueTasks > 0 ? (
              <FaExclamationCircle className="text-red-500 text-2xl" />
            ) : (
              <FaCheckCircle className="text-green-500 text-2xl" />
            )}
            <div>
              <strong className="font-bold text-lg">
                {pastDueTasks > 0 ? "Overdue Tasks" : "No Overdue Tasks"}
              </strong>
              <p className="text-sm">
                {pastDueTasks > 0 ? (
                  <>
                    there are <span className="font-bold">{pastDueTasks}</span>{" "}
                    overdue tasks. Please check and complete them.
                  </>
                ) : (
                  "Great job! You have no overdue tasks."
                )}
              </p>
            </div>
          </div>
          <ProgressCircle
            completed={doneTasks?.length}
            total={project.tasks?.length - cancelTasks?.length}
          />
        </div>

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
              ? project.Description
              : `${project.Description?.substring(0, 250)}`}
            {showMore && (
              <div className="my-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {project.documents.map((document, index) => (
                  <div
                    key={index}
                    className="text-black border-2 flex flex-col justify-between items-center">
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
                          onClick={() =>
                            handleDownload(
                              `http://localhost:1937/uploads/${document}`
                            )
                          }
                          className="text-black hover:text-blue-400 download w-6 h-6 cursor-pointer mr-2"
                        />
                        {userRole === "orgBoss" && (
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

            <button className="btn" onClick={() => setShowMore(!showMore)}>
              {showMore ? "" : "..."}
              <span className="text-sm text-blue-600">
                {showMore ? "Show less" : "Show more"}
              </span>
            </button>
          </div>
        ) : null}
      </div>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(255, 255, 255, 0)",
        }}
        className={` fixed inset-0 z-50  overflow-y-auto justify-center items-center flex     ${
          updateProjectModal ? "opacity-100 visible" : "opacity-0 invisible"
        } `}>
        <div
          style={{ width: "90vw", height: "90vh" }}
          className="myShadow relative mx-auto   rounded-lg shadow-md bg-white">
          <div className="flex justify-between items-center px-5 border-b border-gray-200">
            <h3
              style={{ height: "10vh" }}
              className="text-xl sm:text-3xl font-medium text-gray-900 flex items-center">
              Update Project{" "}
            </h3>

            <button
              type="button"
              onClick={handleCachUpdateProjectForm}
              className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            {updateProjectModal && showUpdateProjectForm ? (
              <UpdateProjectForm
                project={project}
                handleCachUpdateProjectForm={handleCachUpdateProjectForm}
                reloadpage={reloadpage}
                reload={reload}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
