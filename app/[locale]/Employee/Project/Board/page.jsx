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
  const [project, setProject] = useState({});
  const axiosInstance = axios.create({
    baseURL: "http://localhost:1937",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const projectId = "666357fcb6ef230e0e262884";

  const fetchProject = async (projectId) => {
    try {
      const response = await axiosInstance.get(`/project/projects?_id=${projectId}`);
      const projectData = response.data[0];
      console.log("project = ", response.data[0])
      setProject(projectData);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes :', error);
    }
  };

  useEffect(() => {
    fetchProject(projectId);
    
  }, []);

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
              <ProjectDetails project={project} />
              <BoardMain project={project} />
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