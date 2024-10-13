"use client";
import React, { useRef } from "react";
import "./style.css";
import { Fragment, useState, useEffect } from "react";
import MainProject from "@/components/Employee/Project/Main";
import SideBarProject from "@/components/Employee/Project/SideBar";
import SideBarEmployee from "@/components/Employee/SideBarEmployee";
import ProtectedRoute from "@/components/ProtectedRoute";
import BoardMain from "@/components/Employee/Project/Main/BoardMain/index";
import KanbanBoard from "@/components/Employee/Project/Main/Kanban";
import MainEmployee from "@/components/Employee/Main";
import NavBarAuth from "@/components/NavBar/NavBarAuth";
import MenuProject from "@/components/Employee/Project/MenuProject";
import ProjectDetails from "@/components/Employee/Project/Main/DetailsMain";
import ProgressCircle from "@/components/Employee/components/ProgressCercle";
import Loader from "@/components/Loader";
import axios from "axios";

function Board() {
  const [showSideBar, setShowSideBar] = useState(true);
  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState({});
  const [reload, setReload] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [organization, setOrganization] = useState({});
  const [teamId, setTeamId] = useState("");
  const reloadpage = (a) => {
    setReload(!a);
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const projectinfo = localStorage.getItem("project");
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      if (projectinfo && userinfo && orga) {
        let projectJson = JSON.parse(projectinfo);
        setProjectId(projectJson?._id);
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
  const axiosInstance = axios.create({
    baseURL: "http://localhost:1937",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // const projectId = "666357fcb6ef230e0e262884";

  const fetchProject = async (projectId) => {
    console.log("projectIdddddddddddddddddddddddddddddddd");
    try {
      console.log("projectId : " + projectId);
      const response = await axiosInstance.get(
        `/project/projects?_id=${projectId}`
      );
      const projectData = response.data[0];
      console.log("project = ", response.data[0]);
      setProject(projectData);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes :", error);
    }
  };

  useEffect(() => {
    if (projectId != null) {
      fetchProject(projectId);
    }
  }, [projectId, reload]);
  return (
    <div className="bg-white text-black">
      <NavBarAuth
        className="flex-none"
        auth={true}
        showOrganisation={false}
        isShowSideBar={true}
        showSideBar={showSideBar}
        setShowSideBar={setShowSideBar}
      />
      <div style={{ height: "90vh" }} className="flex flex-shrink-0">
        {showSideBar ? <SideBarEmployee currentPage="Project" /> : null}
        <div className="w-full overflow-auto costumScrollBar">
          <MenuProject activePageIndex={0} />
          {/* Vérifier si project n'est pas vide avant de rendre les composants */}
          {Object.keys(project).length > 0 ? (
            <>
              <ProjectDetails
                project={project}
                reloadpage={reloadpage}
                reload={reload}
              />
              <BoardMain
                project={project}
                user={userInfo}
                reloadpage={reloadpage}
                reload={reload}
              />
            </>
          ) : (
            <Loader /> // Afficher le composant Loader si le projet n'est pas récupéré
          )}
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute(Board);
