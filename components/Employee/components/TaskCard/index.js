"use client";
import React, { Fragment, useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaClipboardList,
  FaUserFriends,
  FaEye,
} from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const TaskCard = (task) => {
  const router = useRouter();
  const axiosInstance = axios.create({
    baseURL: "https://pfe-master-backend.vercel.app",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const fetchTask = async (taskId) => {
    try {
      const response = await axiosInstance.get(`/task/tasks?_id=${taskId}`);
      const task = response.data[0];
      setTaskData(task);
    } catch (error) {
      console.error("Erreur lors de la récupération de la tache :", error);
      return {};
    }
  };

  const [taskData, setTaskData] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Nouvel état pour suivre si la tâche est en cours de glissement
  const locale = useLocale();
  useEffect(() => {
    // fetchTask(task?._id);
    setTaskData(task);
  }, [task]);

  const priorityClasses = {
    A: "bg-red-500 text-white",
    B: "bg-orange-500 text-white",
    C: "bg-green-500 text-white",
    D: "bg-yellow-500 text-white",
    E: "bg-gray-500 text-white",
  };
  const priorityClass =
    {
      A: "bg-red-500 text-white",
      B: "bg-orange-500 text-white",
      C: "bg-yellow-500 text-white",
      D: "bg-green-500 text-white",
    }[task.priority] || "bg-blue-500 text-white";

  const handleDragStart = (e) => {
    e.dataTransfer.setData("_id", task?._id?.toString());
    setIsDragging(true); // Mettre à jour l'état lors du début du glissement
  };

  const handleDragEnd = () => {
    setIsDragging(false); // Mettre à jour l'état lorsque le glissement se termine
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 mb-4 ${
        isDragging ? "dragging" : ""
      }`} // Appliquer la classe CSS conditionnellement
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd} // Gérer la fin du glissement
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{taskData?.Name}</h3>
        <span
          className={`px-2 py-1 rounded-full ${
            priorityClasses[taskData?.priorite] || "bg-gray-500 text-white"
          }`}>
          {taskData?.priorite}
        </span>
      </div>
      <div className={`${showMore ? "block" : "hidden"}`}>
        <div className="flex items-center mb-2">
          <FaCalendarAlt className="mr-2 text-gray-500" />
          <span className="text-sm text-gray-600">
            Début:{" "}
            {taskData?.dateDebutEstim &&
              new Date(taskData?.dateDebutEstim).toISOString().split("T")[0]}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <FaCalendarAlt className="mr-2 text-gray-500" />
          <span className="text-sm text-gray-600">
            Fin:{" "}
            {taskData?.dateFinEstim &&
              new Date(taskData?.dateFinEstim).toISOString().split("T")[0]}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <FaClipboardList className="mr-2 text-gray-500" />
          <span className="text-sm text-gray-600">
            Projet: {taskData?.projet?.Name}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <FaUserFriends className="mr-2 text-gray-500" />
          <span className="text-sm text-gray-600">
            Équipe: {taskData?.team?.Name}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button
          className="text-[#314155] hover:text-blue-700 focus:outline-none flex items-center"
          onClick={() => setShowMore(!showMore)}>
          {showMore ? (
            <Fragment>
              Masquer les détails <FaChevronUp className="ml-2" />
            </Fragment>
          ) : (
            <Fragment>
              Afficher les détails <FaChevronDown className="ml-2" />
            </Fragment>
          )}
        </button>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => {
            router.push(
              `/${locale}/Employee/Task?task=${JSON.stringify(task?._id)}`
            );
          }}
          className="bg-[#314155] text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none inline-flex items-center"
          style={{ maxWidth: "fit-content" }}>
          <FaEye className="mr-2" />
          <span>Voir</span>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
