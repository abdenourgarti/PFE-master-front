"use client";
import React, { useRef } from "react";
import "./style.css";

import { Fragment, useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

import MainProject from "@/components/Employee/Project/Main";
import SideBarEmployee from "@/components/Employee/SideBarEmployee";
import CalendrierView from "@/components/Calendrier";
import KanbanBoard from "@/components/Employee/Project/Main/Kanban";
import MainEmployee from "@/components/Employee/Main";
import NavBarAuth from "@/components/NavBar/NavBarAuth";
import axios from "axios";

function SchedulerEmployee() {
  const [sideBarEmployeeShow, setSideBarEmployeeShow] = useState(true);
  const [userInfo, setUserInfo] = useState({});
  const [userRole, setUserRole] = useState("");
  const [reload, setReload] = useState(false);
  const [organization, setOrganization] = useState({});
  const [teamId, setTeamId] = useState("");
  const [tasks, setTasks] = useState([]);
  const reloadpage = (a) => {
    setReload(!a);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      const role = localStorage.getItem("userRole");
      if (userinfo && orga && role) {
        let userJson = JSON.parse(userinfo);
        setUserInfo(userJson);
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);
        setUserRole(role);

        const team = userJson?.team.find(
          (obj) => obj.Organization === orgaJson._id
        );
        setTeamId(team?._id);
      }
    }
  }, []);
  useEffect(() => {
    const fetchTasks = async () => {
      switch (userRole) {
        case "employee":
          try {
            const response = await axiosInstance.get(`/user/userTasks`, {
              params: {
                organizationId: organization?._id,
                userId: userInfo._id,
                teamId: teamId,
              },
            });
            setTasks(response.data);
          } catch (error) {
            console.error("Erreur lors de la récupération des tâches :", error);
          }
          break;
        case "teamBoss":
          try {
            const response = await axiosInstance.get(`/user/userTasks`, {
              params: {
                organizationId: organization?._id,

                userId: userInfo._id,
                teamId: teamId,
              },
            });
            setTasks(response.data);
          } catch (error) {
            console.error("Erreur lors de la récupération des tâches :", error);
          }
          break;
        case "prjctBoss":
          try {
            const response = await axiosInstance.get(`/user/userTasks`, {
              params: {
                userId: userInfo._id,
                organizationId: organization._id,
              },
            });
            setTasks(response.data);
          } catch (error) {
            console.error("Erreur lors de la récupération des tâches :", error);
          }
          break;
        case "orgBoss":
          try {
            const response = await axiosInstance.get(`/user/userTasks`, {
              params: {
                userId: userInfo._id,
                organizationId: organization._id,
              },
            });
            setTasks(response.data);
          } catch (error) {
            console.error("Erreur lors de la récupération des tâches :", error);
          }
          break;
      }
    };

    if (userInfo && teamId && organization) {
      fetchTasks();
    }
  }, [userInfo, teamId, organization]);
  const axiosInstance = axios.create({
    baseURL: "https://pfe-master-backend.vercel.app",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return (
    <div className=" bg-white text-black ">
      <NavBarAuth
        className="flex-none"
        auth={true}
        showOrganisation={false}
        isShowSideBarEmployee={true}
        sideBarEmployeeShow={sideBarEmployeeShow}
        setSideBarEmployeeShow={setSideBarEmployeeShow}
      />
      <div style={{ height: "90vh" }} className=" flex flex-shrink-0 ">
        {sideBarEmployeeShow ? (
          <SideBarEmployee currentPage="Scheduler" fromEmployee={true} />
        ) : null}
        {/* <MainProject sideBarEmployeeShow={sideBarEmployeeShow} /> */}

        <CalendrierView tasks={tasks} />
      </div>
    </div>
  );
}

export default ProtectedRoute(SchedulerEmployee);
