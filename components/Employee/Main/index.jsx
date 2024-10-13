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
import Loader from "@/components/Loader";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function MainEmployee({ reloadPage }) {
  const [projects, setProjects] = useState(null);
  const [organizationId, setOrganizationId] = useState("");
  const [settings, setSettings] = useState({});
  const [allTasks, setAllTasks] = useState(null);
  const [todoTasks, setTodoTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [inReviewTasks, setInReviewTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [cancelTasks, setCancelTasks] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reload, setReload] = useState(false); // State to trigger rerender
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
    setCancelTasks(tasks.filter((task) => task.status === "Cancel"));
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
  const [userRole, setUserRole] = useState("");
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      const role = localStorage.getItem("userRole");
      if (userinfo && orga && role) {
        console.log("userinfoooooooooooooooooooooooooooo");

        let userJson = JSON.parse(userinfo);
        console.log(userinfo);
        setUserInfo(userJson);
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);
        setUserRole(role);

        const team = userJson?.team?.find(
          (obj) => obj.Organization === orgaJson._id
        );
        setTeamId(team?._id);
      }
    }
  }, []);
  const fetchProjectsAndTasks = async (organizationId, userId) => {
    console.log("ghjkjhh");
    if (userInfo && userRole === "orgBoss") {
      console.log("fetch project orgggg");
      try {
        const response = await axiosInstance.get(
          `/project/projects?organization=${organizationId}`
        );
        console.log("responseData = ", response.data);
        setProjects(response.data);
        const response1 = await axiosInstance.get(`/user/userTasks`, {
          params: {
            userId: userId,

            organizationId: organization._id,
          },
        });
        const tasks = response1.data;
        setAllTasks(tasks);
        filterTasks(tasks);
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
      }
    } else if (userInfo && userRole === "prjctBoss") {
      try {
        // Récupérer les projets
        const projectsResponse = await axiosInstance.get(
          `/project/projects?organization=${organizationId}&boss=${userId}`
        );
        const projects = projectsResponse.data;
        setProjects(projects);

        // Extraire les IDs des projets
        const projectIds = projects?.map((project) => project?._id);

        // Récupérer les tâches liées à ces projets
        const tasksResponse = await axiosInstance.get(`/user/userTasks`, {
          params: {
            userId: userId,
            organizationId: organization._id,
          },
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
    } else if (userInfo && userRole === "teamBoss") {
      try {
        const response = await axiosInstance.get(`/user/userProjects`, {
          params: { userId: userId, organizationId: organization?._id },
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
    } else if (userInfo && userRole === "employee") {
      try {
        const response = await axiosInstance.get(`/user/userProjects`, {
          params: { userId: userInfo?._id, organizationId: organization?._id },
        });
        console.log("responseData = ", response.data);
        setProjects(response.data);

        const tasksResponse = await axiosInstance.get(`/user/userTasks`, {
          params: {
            userId: userId,
            organizationId: organization?._id,
            teamId: teamId,
          },
        });
        const tasks = tasksResponse.data;
        setAllTasks(tasks);
        filterTasks(tasks);
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
  const reloadpage = (a) => {
    setReload(!a);
  };
  useEffect(() => {
    console.log("use effect oneeee");

    if (userInfo?._id && organization?._id && userRole) {
      console.log("use effect");
      fetchProjectsAndTasks(organization._id, userInfo._id);
    }
    // <<<<<<< HEAD
    // }, [organization, userInfo, teamId, reload, reloadPage]);

    // =======
  }, [organization, userInfo, userRole, teamId, reload]);
  // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
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
          slidesToShow: projects?.length >= 2 ? 2 : 1,
          slidesToScroll: 1,
          prevArrow: <SamplePrevArrow />,
          nextArrow: <SampleNextArrow />,
        }));
      } else if (screenWidth < 1050) {
        setSettings(() => ({
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: projects?.length >= 3 ? 3 : 1,
          slidesToScroll: 1,
          prevArrow: <SamplePrevArrow />,
          nextArrow: <SampleNextArrow />,
        }));
      } else {
        setSettings(() => ({
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: projects?.length >= 4 ? 4 : 1,
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
    { value: "Cancel", label: "Canceled" },
  ];
  const defaultStatus = { value: "worked on", label: "Worked On" };
  const [navigation, setNavigation] = useState([
    { name: "To Do", href: `#`, current: true },
    { name: "In Progress", href: "#", current: false },
    { name: "In Review", href: `#`, current: false },
    { name: "Done", href: `#`, current: false },
    { name: "Canceled", href: `#`, current: false },
  ]);
  const [curScreen, setCurScreen] = useState(0);
  // /const [showAddProjectFrom, setShowAddProjectFrom] = useState(false);
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const handleCachAddProjectForm = () => {
    setShowAddProjectForm(false);
    // Ne ferme pas la modal seeAllProjectsModal
  };

  const handleShowAddProjectForm = () => {
    setShowAddProjectForm(true);
  };
  return (
    <>
      {/* {(allTasks && projects) ? ( */}
      <div
        style={{ height: "90vh" }}
        className={"  w-screen overflow-auto costumScrollBar pb-40"}>
        <div className="p-4 sm:p-10    ">
          <h1 className="w-10/12 border-b-2 py-3   ">
            Company &nbsp;&nbsp; &#x276F; &nbsp;&nbsp; &nbsp;&nbsp;
          </h1>

          <div className=" mt-10 w-full  flex justify-between items-center">
            <h1 className="text-2xl     ">
              Your Projects ({projects?.length}):
              {/* &nbsp;&nbsp; &#x276F; &nbsp;&nbsp; departement &nbsp;&nbsp;
          &#x276F; &nbsp;&nbsp; project Name{" "} */}
            </h1>
            <button
              onClick={() => {
                setShowAddProjectForm(false);
                setSeeAllProjectsModal(true);
              }}
              className="underline text-blue-600 hover:no-underline">
              See all projects
            </button>
          </div>

          {projects?.length > 0 ? (
            <div className=" w-12/12 overflow-auto costumScrollBar flex items-center">
              {projects?.map((child, index) => (
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
          <div className="hidden sm:flex border-b-2">
            {navigation.map((item, index) => (
              <button
                onClick={() => setCurScreen(index)}
                key={item.name}
                className={classNames(
                  index === curScreen
                    ? "bg-gray-900 text-white"
                    : "text-gray-900 hover:bg-gray-700 hover:text-white",
                  "px-3 py-2 text-sm font-medium border-r-2"
                )}
                aria-current={item.current ? "page" : undefined}>
                {item.name}
              </button>
            ))}
          </div>
          <div className="w-12/12 sm:hidden flex flex-row-reverse">
            <div className="w-8/12 border-2 flex justify-start items-center px-2 input rounded-xl h-10 ">
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
                defaultValue={defaultStatus}
                // placeholder={defaultStatus.label}
                className="w-full"
                options={Status}
                onChange={handleChangeStatus}
              />
            </div>
          </div>
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

            {curScreen === 4 && cancelTasks.length > 0 ? (
              cancelTasks.map((task, taskIndex) => (
                <TaskListElement
                  key={taskIndex}
                  task={task}
                  project={task.projet}
                />
              ))
            ) : curScreen === 4 ? (
              <div className="w-full my-4 py-2 text-gray-00 flex justify-center items-center border-gray-600 border-2 border-dashed">
                Your Task list is empty for "Canceled" tasks
              </div>
            ) : null}
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
            seeAllProjectsModal ? "opacity-100 visible" : "opacity-0 invisible"
          } `}>
          <div
            style={{ width: "90vw", height: "90vh" }}
            className="myShadow relative mx-auto   rounded-lg shadow-md bg-white">
            <div className="flex justify-between items-center px-5 border-b border-gray-200">
              {!showAddProjectForm ? (
                <Fragment>
                  <div className="flex justify-center items-center">
                    <h3
                      style={{ height: "10vh" }}
                      className="mr-4 text-xl font-medium text-gray-900 flex items-center">
                      All Projects ({projects?.length})
                    </h3>
                    {userRole === "orgBoss" && (
                      <button
                        onClick={() => handleShowAddProjectForm()}
                        className="flex items-center my-4 rounded border-b-4 border-violet-700 bg-violet-500 px-4 py-2 font-bold text-white hover:border-violet-500 hover:bg-violet-400"
                        type="submit">
                        <IoMdAddCircle className="w-6 h-6 mr-2" />
                        <span>Add Project</span>
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSeeAllProjectsModal(false);
                      setShowAddProjectForm(false);
                    }}
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
                </Fragment>
              ) : (
                <Fragment>
                  <div className="flex justify-center items-center">
                    <h3
                      style={{ height: "10vh" }}
                      className="text-xl sm:text-3xl font-medium text-gray-900 flex items-center">
                      Add Project
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProjectForm(false);
                    }}
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
                </Fragment>
              )}
            </div>
            {!showAddProjectForm ? (
              <div>
                {projects?.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "20px",
                      height: "77vh",
                      overflowY: "auto",
                    }}
                    className="p-6 costumScrollBar overflow-y-auto">
                    {projects?.map((child, index) => (
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
                  justifyContent: "center",
                  height: "78vh",
                  overflowY: "auto",
                }}
                className="p-6 costumScrollBar overflow-y-auto">
                <AddProjectForm
                  organization={organization}
                  handleCachAddProjectForm={handleCachAddProjectForm}
                  reloadpage={reloadpage}
                  reload={reload}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ) : (
    <Loader /> // Afficher le composant Loader si le projet n'est pas récupéré
  )} */}
    </>
  );
}

export default React.memo(MainEmployee);
