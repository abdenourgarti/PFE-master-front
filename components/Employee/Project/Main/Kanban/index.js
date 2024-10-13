"use client";
import Column from "./components/Column";
import "./style.css";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Loader from "@/components/Loader";
const KanbanBoard = ({ project, user, teamId, role }) => {
  const axiosInstance = axios.create({
    baseURL: "https://pfe-master-backend.vercel.app",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    const fetchTasks = async () => {
      let taskIds;
      // <<<<<<< HEAD
      //       switch (user?.role) {
      // case "employee":
      //   taskIds = project.tasks
      //     ?.filter((task) => task?.affectedto === user._id)
      //     .map((task) => task._id);
      //   break;
      // case "teamBoss":
      //   taskIds = project.tasks
      //     ?.filter((task) => task?.team === teamId)
      //     .map((task) => task._id);
      //   break;
      // =======
      switch (role) {
        // case "employee":
        //   taskIds = project.tasks
        //     ?.filter((task) => task?.affectedto === user._id)
        //     .map((task) => task._id);
        //   break;
        // case "teamBoss":
        //   taskIds = project.tasks
        //     ?.filter((task) => task?.team === teamId)
        //     .map((task) => task._id);
        //   break;
        // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
        default:
          taskIds = project.tasks?.map((task) => task._id);
          break;
      }

      try {
        const response = await axiosInstance.get(
          `/task/tasks?_id=${taskIds.join("&_id=")}`
        );
        setTasks(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches :", error);
      }
    };

    fetchTasks();
  }, [project, user, teamId, role]);

  const onDragOver = (e) => {
    e.preventDefault(); // Nécessaire pour permettre le drop
  };

  const updateTaskStatus = useCallback(
    async (taskId, newStatus) => {
      try {
        await axiosInstance.patch(`/task/tasks/${taskId}`, {
          status: newStatus,
        });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut :", error);
      }
    },
    [axiosInstance]
  );

  const onDrop = useCallback(
    (e, newStatus, newIndex) => {
      const id = e.dataTransfer.getData("_id");
      const draggedTask = tasks.find((task) => task._id.toString() === id);
      const updatedTasks = tasks.filter((task) => task._id.toString() !== id);

      if (draggedTask && draggedTask.status === newStatus) {
        // Réordonnancement à l'intérieur de la même colonne
        updatedTasks.splice(newIndex, 0, draggedTask);
        setTasks(updatedTasks);
      } else {
        // Changement de colonne
        if (draggedTask) {
          const updatedTask = { ...draggedTask, status: newStatus };
          updateTaskStatus(updatedTask._id, newStatus);
          updatedTasks.splice(newIndex, 0, updatedTask);
          setTasks(updatedTasks);
        }
      }
    },
    [tasks, updateTaskStatus]
  );

  const getTasksForStatus = (status) => {
    const tasksForStatus =
      tasks?.filter((task) => task?.status === status) || [];
    return tasksForStatus.sort((a, b) => {
      const priorityOrder = ["A", "B", "C", "D", "E"];
      const priorityA = priorityOrder.indexOf(a.priorite);
      const priorityB = priorityOrder.indexOf(b.priorite);
      return priorityA - priorityB; // Tri ascendant
    });
  };

  return (
    <>
      {tasks.length > 0 ? (
        <div
          style={{ height: "90vh" }}
          className="flex flex-col lg:flex-row w-full  overflow-auto costumScrollBar">
          <div className="w-full lg:ml-50 p-4">
            <h1 className="text-3xl font-bold mb-4">Tasks</h1>
            <div className="flex flex-wrap -mx-4">
              <Column
                title="Todo"
                tasks={getTasksForStatus("Todo")}
                onDrop={onDrop}
                onDragOver={onDragOver}
                status="Todo"
              />
              <Column
                title="In progress"
                tasks={getTasksForStatus("Inprogress")}
                onDrop={onDrop}
                onDragOver={onDragOver}
                status="Inprogress"
              />
              <Column
                title="In Review"
                tasks={getTasksForStatus("Inreview")}
                onDrop={onDrop}
                onDragOver={onDragOver}
                status="Inreview"
              />
              <Column
                title="Done"
                tasks={getTasksForStatus("Done")}
                onDrop={onDrop}
                onDragOver={onDragOver}
                status="Done"
              />
            </div>
          </div>
        </div>
      ) : (
        <Loader /> // Afficher le composant Loader si le projet n'est pas récupéré
      )}
    </>
  );
};

export default React.memo(KanbanBoard);
