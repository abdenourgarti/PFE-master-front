"use client";
import CalendrierView from "@/components/Calendrier";
import {
  FaTrash,
  FaBell,
  FaTimes,
  FaRegEnvelope,
  FaCalendarAlt,
  FaClipboardList,
  FaTasks,
  FaUserFriends,
  FaChartBar,
} from "react-icons/fa";
import "./style.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";
import NotificationListElement from "@/components/NotificationListElement";
import NavBarAuth from "@/components/NavBar/NavBarAuth";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

const Notification = () => {
  const [notifications, setNotifications] = useState(null);
  const [reload, setReload] = useState(false);

  const [userInfo, setUserInfo] = useState(null);
  const [organization, setOrganization] = useState(null);
  const locale = useLocale();
  const router = useRouter();

  const axiosInstance = axios.create({
    baseURL: "https://pfe-master-backend.vercel.app",
    headers: {
      "Content-Type": "application/json",
    },
  });
  useEffect(() => {
    console.log("yawwwww rani hnaaa");
    console.log("localstor = ", localStorage);
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      if (userinfo && orga) {
        let userJson = JSON.parse(userinfo);
        console.log("userJson");

        console.log(userJson);
        setUserInfo(userJson);
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);
      }
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      if (userinfo) {
        let userJson = JSON.parse(userinfo);
        setUserInfo(userJson);
      }
      if (orga) {
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);
      }
    }
  }, [reload]);
  useEffect(() => {
    const getNotifications = async () => {
      try {
        if (userInfo && organization) {
          // Vérifier si userInfo et organization ne sont pas null
          const response = await axiosInstance.get(
            "/notification/notifications",
            {
              params: {
                recipient: userInfo._id,
                organization: organization._id,
              },
            }
          );
          const sortedNotifications = response.data.sort(sortByDate);
          setNotifications(sortedNotifications);
        } else {
          console.error("userInfo or organization is null");
        }
      } catch (error) {
        console.error("Error fetching user notifications:", error);
        throw error;
      }
    };

    if (userInfo) {
      getNotifications();
    }
  }, [reload]);
  useEffect(() => {
    const getNotifications = async () => {
      try {
        if (userInfo && organization) {
          // Vérifier si userInfo et organization ne sont pas null
          const response = await axiosInstance.get(
            "/notification/notifications",
            {
              params: {
                recipient: userInfo._id,
                organization: organization._id,
              },
            }
          );
          const sortedNotifications = response.data.sort(sortByDate);
          setNotifications(sortedNotifications);
        } else {
          console.error("userInfo or organization is null");
        }
      } catch (error) {
        console.error("Error fetching user notifications:", error);
        throw error;
      }
    };

    if (userInfo) {
      getNotifications();
    }
  }, [userInfo, organization]);

  const sortByDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

  const GotoNotifacations = async (notification) => {
    switch (notification.type) {
      case "project":
        const projectInfo = localStorage.getItem("project");
        if (projectInfo) {
          localStorage.removeItem("project");
        }

        await localStorage.setItem("project", notification?.content?.url);
        router.push(`/${locale}/Employee/Project/Board`);
        break;
      case "task":
        router.push(
          `/${locale}/Employee/Task?task=${JSON.stringify(
            JSON.parse(notification?.content?.url)._id
          )}`
        );
        break;
      case "comment":
        router.push(
          `/${locale}/Employee/Task?task=${JSON.stringify(
            JSON.parse(notification?.content?.url)._id
          )}`
        );
        break;
      case "invitation":
        router.push(
          `/${locale}/Employee/Invitation?invitation=${notification?.content?.url}`
        );
        break;
      default:
        break;
    }
    if (!notification?.seen?.seen) {
      try {
        const response = await axiosInstance.patch(
          "/notification/notifications",
          {
            notificationId: notification?._id,
            userId: userInfo._id,
          }
        );
        console.log("notification mis à jour");
      } catch (error) {
        console.log(error);
      }
    }
    setReload(!reload);
  };

  return (
    <div className=" ">
      <NavBarAuth />

      <div
        style={{ height: "90vh" }}
        className="flex flex-col items-center bg-white  overflow-auto costumScrollBar shadow-md  px-4">
        <div className=" w-full text-black text-2xl px-4 my-4  font-semibold">
          Notifications ({notifications ? notifications?.length : 0}):
        </div>
        {notifications?.length > 0 ? (
          notifications?.map((notification, index) => (
            <NotificationListElement
              key={index}
              notification={notification}
              GotoNotifacations={GotoNotifacations}
            />
          ))
        ) : (
          <div className="w-full rounded-sm  my-4 py-2 text-gray-00 flex justify-center items-center text-gray-500 border-gray-600  border-2 border-dashed">
            your notifications list is emptry
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectedRoute(Notification);
