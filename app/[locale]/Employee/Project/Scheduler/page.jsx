"use client";
import React, { useRef } from "react";
import "./style.css";

import { Fragment, useState, useEffect } from "react";
import MainProject from "@/components/Employee/Project/Main";
import SideBarProject from "@/components/Employee/Project/SideBar";
import SideBarEmployee from "@/components/Employee/SideBarEmployee";
import CalendrierView from "@/components/Calendrier";
import ProtectedRoute from "@/components/ProtectedRoute";

import KanbanBoard from "@/components/Employee/Project/Main/Kanban";
import MainEmployee from "@/components/Employee/Main";
import NavBarAuth from "@/components/NavBar/NavBarAuth";
import MenuProject from "@/components/Employee/Project/MenuProject";
import axios from "axios";

function Scheduler() {
  const [showSideBar, setShowSideBar] = useState(true);
  const [projectId, setProjectId] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [userRole, setUserRole] = useState("");
  const [project, setProject] = useState({});
  const [reload, setReload] = useState(false);
  const [organization, setOrganization] = useState({});
  const [teamId, setTeamId] = useState("");
  const [tasks, setTasks] = useState([]);
  const reloadpage = (a) => {
    setReload(!a);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orga = localStorage.getItem("organization");
      const projectinfo = localStorage.getItem("project");
      const userinfo = localStorage.getItem("userInfo");
      const role = localStorage.getItem("userRole");
      if (userinfo && orga && projectinfo && role) {
        let userJson = JSON.parse(userinfo);
        setUserInfo(userJson);
        setUserRole(role);
        let projectJson = JSON.parse(projectinfo);
        setProjectId(projectJson?._id);
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);

        const team = userJson?.team.find(
          (obj) => obj.Organization === orgaJson._id
        );
        setTeamId(team?._id);
      }
    }
  }, []);
  useEffect(() => {
    let Tasks;
    // <<<<<<< HEAD
    // switch (userInfo?.role) {
    // case "employee":
    //   Tasks = project.tasks
    //     ?.filter((task) => task?.affectedto === userInfo?._id)
    //     .map((task) => task);
    //   setTasks(Tasks);
    //   break;
    // case "teamBoss":
    //   Tasks = project.tasks
    //     ?.filter((task) => task?.team === teamId)
    //     .map((task) => task);
    //   setTasks(Tasks);
    //   break;
    // =======
    switch (userRole) {
      // case "employee":
      //   Tasks = project.tasks
      //     ?.filter((task) => task?.affectedto === userInfo?._id)
      //     .map((task) => task);
      //   setTasks(Tasks);
      //   break;
      // case "teamBoss":
      //   Tasks = project.tasks
      //     ?.filter((task) => task?.team === teamId)
      //     .map((task) => task);
      //   setTasks(Tasks);
      //   break;
      // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
      default:
        console.log("project tasks =", project.tasks);
        Tasks = project.tasks;
        setTasks(Tasks);
        break;
    }

    // try {
    //   const response = await axiosInstance.get(`/task/tasks?_id=${taskIds.join('&_id=')}`);
    //   setTasks(response.data);
    // } catch (error) {
    //   console.error("Erreur lors de la récupération des tâches :", error);
    // }
  }, [project, userInfo, teamId, userRole]);
  const axiosInstance = axios.create({
    baseURL: "https://pfe-master-backend.vercel.app",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // const projectId = "666357fcb6ef230e0e262884";

  const fetchProject = async (projectId) => {
    try {
      const response = await axiosInstance.get(
        `/project/projects?_id=${projectId}`
      );
      const projectData = response.data[0];

      setProject(projectData);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes :", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, reload]);

  return (
    <div className=" bg-white text-black ">
      <NavBarAuth
        className="flex-none"
        auth={true}
        showOrganisation={false}
        isShowSideBar={true}
        showSideBar={showSideBar}
        setShowSideBar={setShowSideBar}
      />
      <div style={{ height: "90vh" }} className=" flex flex-shrink-0 ">
        {showSideBar ? <SideBarEmployee currentPage="Project" /> : null}
        {/* <MainProject showSideBar={showSideBar} /> */}
        <div
          style={{ height: "90vh" }}
          className="w-full overflow-auto costumScrollBar">
          <MenuProject activePageIndex={2} />
          <CalendrierView tasks={tasks} />
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute(Scheduler);
