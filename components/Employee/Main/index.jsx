import React from "react";
import { Fragment, useState, useEffect } from "react";
import ProjectCard from "../components/ProjectCard";
import "./style.css";
import Select from "react-select";
import {
  IoMdArrowDropdown,
  IoMdArrowDropright,
  IoMdAddCircle,
} from "react-icons/io";
import {
  MdAlternateEmail,
  MdBusinessCenter,
  MdArrowDropDown,
  MdOutlinePassword,
} from "react-icons/md";
import { RiArrowGoBackFill } from "react-icons/ri";
import TaskListElement from "../components/TaskListElement";
import AddProjectForm from "../Project/AddProjectForm";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import UpdateProjectForm from "../Project/UpdateProjectForm";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function MainEmployee() {
  const [projects, setProjects] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [settings, setSettings] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const [todoTasks, setTodoTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [inReviewTasks, setInReviewTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchTasks = async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/task/userTasks?userId=${userId}`
      );
      setAllTasks(response.data);
      filterTasks(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches :", error);
    }
  };
  const filterTasks = (tasks) => {
    setTodoTasks(tasks.filter((task) => task.status === "Todo"));
    setInProgressTasks(tasks.filter((task) => task.status === "Inprogress"));
    setInReviewTasks(tasks.filter((task) => task.status === "Inreview"));
    setDoneTasks(tasks.filter((task) => task.status === "Done"));
  };

  const [seeAllProjectsModal, setSeeAllProjectsModal] = useState(false);
  const axiosInstance = axios.create({
    baseURL: "http://localhost:1937",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const [userInfo, setUserInfo] = useState({});
  const [organization, setOrganization] = useState({});
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      if (userinfo && orga) {
        let userJson = JSON.parse(userinfo);
        setUserInfo(userJson);
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);

        const team = userJson?.team.find(
          (obj) => obj.Organization === orgaJson._id
        );
        setTeamId(team?._id);
      }
    }
  }, []);
  const fetchProjectsAndTasks = async (organizationId, userId) => {
    if (userInfo?.role === "orgBoss") {
      try {
        const response = await axiosInstance.get(
          `/project/projects?organization=${organizationId}`
        );
        console.log("responseData = ", response.data);
        setProjects(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
      }
    } else if (userInfo?.role === "prjctBoss") {
      try {
        // Récupérer les projets
        const projectsResponse = await axiosInstance.get(
          `/project/projects?organization=${organizationId}&boss=${userId}`
        );
        const projects = projectsResponse.data;
        setProjects(projects);

        // Extraire les IDs des projets
        const projectIds = projects.map((project) => project._id);

        // Récupérer les tâches liées à ces projets
        const tasksResponse = await axiosInstance.get("/task/tasks", {
          params: { projet: projectIds },
        });
        const tasks = tasksResponse.data;
        setAllTasks(tasks);
        filterTasks(tasks);

        console.log("Projets récupérés : ", projects);
        console.log("Tâches récupérées : ", tasks);
        console.log("todoTasks = ", todoTasks);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des projets et des tâches :",
          error
        );
      }
    } else if (userInfo?.role === "teamBoss") {
      try {
        const response = await axiosInstance.get(`/user/userProjects`, {
          params: { userId: userInfo?._id },
        });
        console.log("responseData = ", response.data);
        setProjects(response.data);

        const tasksResponse = await axiosInstance.get("/task/tasks", {
          params: { team: teamId },
        });
        const tasks = tasksResponse.data;
        setAllTasks(tasks);
        filterTasks(tasks);
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
      }
    } else {
      try {
        const response = await axiosInstance.get(`/user/userProjects`, {
          params: { userId: userInfo?._id },
        });
        console.log("responseData = ", response.data);
        setProjects(response.data);

        const tasksResponse = await axiosInstance.get("/task/tasks", {
          params: { affectedto: userInfo?._id },
        });
        const tasks = tasksResponse.data;
        setAllTasks(tasks);
        filterTasks(tasks);
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
      }
    }
  };
  const fetchProject = async (organizationId) => {
    if (userInfo?.role === "orgBoss") {
      try {
        const response = await axiosInstance.get(
          `/project/projects?organization=${organizationId}`
        );
        console.log("responseData = ", response.data);
        setProjects(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
      }
    } else if (userInfo?.role === "prjctBoss") {
      try {
        const response = await axiosInstance.get(
          `/project/projects?organization=${organizationId}&boss=${userInfo?._id}`
        );
        const response1 = await axiosInstance.get(
          `/task/userTasks?userId=${userId}`
        );
        setAllTasks(response1.data);
        filterTasks(response1.data);
        console.log("responseData = ", response.data);
        setProjects(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
      }
    } else {
      try {
        const response = await axiosInstance.get(`/user/userProjects`, {
          params: { userId: userInfo?._id },
        });
        console.log("responseData = ", response.data);
        setProjects(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
      }
    }
  };

  // useEffect(() => {
  //   if (userInfo?._id) {
  //     fetchProject(organization?._id);
  //   }
  // }, [organization]);
  useEffect(() => {
    if (userInfo?._id && organization?._id) {
      fetchProjectsAndTasks(organization._id, userInfo._id);
    }
  }, [organization, userInfo, teamId]);

  useEffect(() => {
    function handleResize() {
      // Adjust the number of slides to show based on screen width
      const screenWidth = window.innerWidth;
      let set = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        prevArrow: <SamplePrevArrow />,
        nextArrow: <SampleNextArrow />,
      };
      if (screenWidth < 450) {
        setSettings(() => ({
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
        }));
      } else if (screenWidth < 750) {
        setSettings(() => ({
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: projects.length >= 2 ? 2 : 1,
          slidesToScroll: 1,
          prevArrow: <SamplePrevArrow />,
          nextArrow: <SampleNextArrow />,
        }));
      } else if (screenWidth < 1050) {
        setSettings(() => ({
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: projects.length >= 3 ? 3 : 1,
          slidesToScroll: 1,
          prevArrow: <SamplePrevArrow />,
          nextArrow: <SampleNextArrow />,
        }));
      } else {
        setSettings(() => ({
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: projects.length >= 4 ? 4 : 1,
          slidesToScroll: 1,
          prevArrow: <SamplePrevArrow />,
          nextArrow: <SampleNextArrow />,
        }));
      }
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "20px",
          background: "grey",
          boxShadow:
            "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
          height: "20vh",
          width: "5vh",
        }}
        onClick={onClick}
      />
    );
  }
  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    console.log(className);
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "20px",
          background: "grey",
          boxShadow:
            "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
          height: "20vh",
          width: "5vh",
        }}
        onClick={onClick}
      />
    );
  }
  const handleChangeStatus = (selectedOption) => {
    console.log("Selected option:", selectedOption);
  };
  const Status = [
    { value: "To Do", label: "To Do" },
    { value: "In Progress", label: "In Progress" },
    { value: "In Review", label: "In Review" },
    { value: "Done", label: "Done" },
  ];
  const defaultStatus = { value: "worked on", label: "Worked On" };
  const [navigation, setNavigation] = useState([
    { name: "To Do", href: `#`, current: true },
    { name: "In Progress", href: "#", current: false },
    { name: "In Review", href: `#`, current: false },
    { name: "Done", href: `#`, current: false },
  ]);
  const [curScreen, setCurScreen] = useState(0);
  const [showAddProjectFrom, setShowAddProjectFrom] = useState(false);
  return (
    <div
      style={{ height: "90vh" }}
      className={"  w-screen overflow-auto costumScrollBar pb-40"}>
      <div className="p-4 sm:p-10    ">
        <h1 className="w-10/12 border-b-2 py-3   ">
          Company &nbsp;&nbsp; &#x276F; &nbsp;&nbsp; departement &nbsp;&nbsp;
        </h1>

        <div className=" mt-10 w-full  flex justify-between items-center">
          <h1 className="text-2xl     ">
            Your Projects :
            {/* &nbsp;&nbsp; &#x276F; &nbsp;&nbsp; departement &nbsp;&nbsp;
          &#x276F; &nbsp;&nbsp; project Name{" "} */}
          </h1>
          <button
            onClick={() => {
              setShowAddProjectFrom(false);
              setSeeAllProjectsModal(true);
            }}
            className="underline text-blue-600 hover:no-underline">
            See all projects
          </button>
        </div>

        {projects.length > 0 ? (
          <div className=" w-12/12 overflow-auto costumScrollBar flex items-center">
            {projects.map((child, index) => (
              <ProjectCard key={index} project={child} />
            ))}
          </div>
        ) : (
          <div className="mt-2 min-w-56 max-w-56 min-h-44 max-h-44  text-gray-00 flex justify-center items-center border-gray-600  border-2 border-dashed rounded-xl">
            No Project
          </div>
        )}
      </div>
      <div className="px-4 sm:px-10 ">
        <div>
          {curScreen === 0 && todoTasks.length > 0 ? (
            todoTasks.map((task, taskIndex) => (
              <TaskListElement
                key={taskIndex}
                task={task}
                project={task.projet}
              />
            ))
          ) : curScreen === 0 ? (
            <div className="w-full my-4 py-2 text-gray-00 flex justify-center items-center border-gray-600 border-2 border-dashed">
              Your Task list is empty for "To Do" tasks
            </div>
          ) : null}

          {curScreen === 1 && inProgressTasks.length > 0 ? (
            inProgressTasks.map((task, taskIndex) => (
              <TaskListElement
                key={taskIndex}
                task={task}
                project={task.projet}
              />
            ))
          ) : curScreen === 1 ? (
            <div className="w-full my-4 py-2 text-gray-00 flex justify-center items-center border-gray-600 border-2 border-dashed">
              Your Task list is empty for "In Progress" tasks
            </div>
          ) : null}

          {curScreen === 2 && inReviewTasks.length > 0 ? (
            inReviewTasks.map((task, taskIndex) => (
              <TaskListElement
                key={taskIndex}
                task={task}
                project={task.projet}
              />
            ))
          ) : curScreen === 2 ? (
            <div className="w-full my-4 py-2 text-gray-00 flex justify-center items-center border-gray-600 border-2 border-dashed">
              Your Task list is empty for "In Review" tasks
            </div>
          ) : null}

          {curScreen === 3 && doneTasks.length > 0 ? (
            doneTasks.map((task, taskIndex) => (
              <TaskListElement
                key={taskIndex}
                task={task}
                project={task.projet}
              />
            ))
          ) : curScreen === 3 ? (
            <div className="w-full my-4 py-2 text-gray-00 flex justify-center items-center border-gray-600 border-2 border-dashed">
              Your Task list is empty for "Done" tasks
            </div>
          ) : null}
        </div>

        {navigation.length > 0 ? (
          <div className="">
            {navigation.map((item, index) => (
              <TaskListElement key={index} />
            ))}
          </div>
        ) : (
          <div className=" w-full my-4 py-2 text-gray-00 flex justify-center items-center border-gray-600  border-2 border-dashed">
            your Task list is emptry
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
          seeAllProjectsModal ? "opacity-100 visible" : "opacity-0 invisible"
        } `}>
        <div
          style={{ width: "90vw", height: "90vh" }}
          className="myShadow relative mx-auto   rounded-lg shadow-md bg-white">
          <div className="flex justify-between items-center px-5 border-b border-gray-200">
            {!showAddProjectFrom ? (
              <div className="flex justify-center items-center">
                {" "}
                <h3
                  style={{ height: "10vh" }}
                  className="hidden  mr-4 text-xl font-medium text-gray-900 sm:flex items-center">
                  All Projects (50)
                </h3>
                <button
                  onClick={() => setShowAddProjectFrom(true)}
                  className=" flex jus items-center my-4 rounded border-b-4 border-violet-700 bg-violet-500 px-4 py-2 font-bold text-white hover:border-violet-500 hover:bg-violet-400"
                  type="submit">
                  <IoMdAddCircle className="w-6 h-6 mr-2" />
                  <span> Add Project</span>
                </button>
              </div>
            ) : (
              <RiArrowGoBackFill
                onClick={() => setShowAddProjectFrom(false)}
                className="ml-2 cursor-pointer text-blue-600 h-5 w-5 mr-2 hover:transform hover:scale-110"
              />
            )}

            {showAddProjectFrom ? (
              <div className="flex justify-center items-center">
                {" "}
                <h3
                  style={{ height: "10vh" }}
                  className="text-xl sm:text-3xl font-medium text-gray-900 flex items-center">
                  Add Project{" "}
                </h3>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setSeeAllProjectsModal(false)}
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
          {!showAddProjectFrom ? (
            <div>
              <h3 className="sm:hidden pl-4 pt-2  text-xl font-medium text-gray-900 flex items-center">
                All Projects (50)
              </h3>
              {projects.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap", // Elements wrap to new line when they overflow
                    justifyContent: "center", // Centers the items horizontally
                    gap: "20px", // Spacing between items
                    height: "77vh",
                    overflowY: "auto", // Enables vertical scrollbar if needed
                  }}
                  className="p-6 costumScrollBar overflow-y-auto">
                  {projects.map((child, index) => (
                    <ProjectCard key={index} project={child} />
                  ))}
                </div>
              ) : (
                <div className="m-10 min-w-56 max-w-56 min-h-44 max-h-44  text-gray-00 flex justify-center items-center border-gray-600  border-2 border-dashed rounded-xl">
                  No Project
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center", // Centers the items horizontally
                height: "78vh",
                overflowY: "auto", // Enables vertical scrollbar if needed
              }}
              className="w-full  costumScrollBar py-10 overflow-y-auto">
              <AddProjectForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainEmployee;
