"use client";
import React from "react";
import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { IoPersonCircle, IoSettings, IoLogOutSharp } from "react-icons/io5";
import {
  MdAlternateEmail,
  MdBusinessCenter,
  MdArrowDropDown,
  MdOutlinePassword,
} from "react-icons/md";
import "./style.css";
import { useDispatch } from "react-redux";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/[locale]/firebase/config";
import { signOut } from "firebase/auth";
import { setOrganization } from "@/store/features/organization/organizationSlice";

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
  FaComment,
  FaEnvelopeOpenText,
  FaExchangeAlt,
} from "react-icons/fa";
import axios from "axios";

import { useAuth } from "@/app/[locale]/context/AuthContext";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function NavBarAuth({
  currentScreen,
  showOrganisation,
  isShowSideBar,
  showSideBar,
  setShowSideBar,
  isShowSideBarEmployee,
  setSideBarEmployeeShow,
  sideBarEmployeeShow,
  page,
}) {
  const axiosInstance = axios.create({
    baseURL: "http://localhost:1937",
    headers: {
      "Content-Type": "application/json",
    },
  });
  // <<<<<<< HEAD
  const [reload, setReload] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [userRole, setUserRole] = useState("");
  const [organization, setOrganization] = useState({});
  useEffect(() => {
    console.log("yawwwww rani hnaaa");
    console.log("localstor = ", localStorage);
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      const role = localStorage.getItem("userRole");
      if (userinfo) {
        let userJson = JSON.parse(userinfo);
        setUserInfo(userJson);
      }
      if (orga) {
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);
      }
      if (role) {
        setUserRole(role);
        console.log("role = ", role);
      }
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      const role = localStorage.getItem("userRole");
      if (userinfo) {
        let userJson = JSON.parse(userinfo);
        setUserInfo(userJson);
      }
      if (orga) {
        let orgaJson = JSON.parse(orga);
        setOrganization(orgaJson);
      }
      if (role) {
        setUserRole(role);
      }
    }
  }, [reload]);

  // =======

  // >>>>>>> 0a7bc172c82c470bedab789337ac3f50e4b0f3a4
  const dispatch = useDispatch();
  // let userInfo = null;
  // let organization = null;

  const organisations = [1, 2, 4, 5];
  const [invitaions, setInvitaions] = useState([]);
  const [notifications, setNotifications] = useState(null);
  const [nbrNotifNot, setNbrNotifNot] = useState(0);
  const [nbrInvitNot, setInvitNot] = useState(0);
  const [nbrNotif, setNbrNotif] = useState(0);
  const getinvitations = async (values) => {
    try {
      const response = await axiosInstance.get("/invitation/invitations", {
        params: {
          sendto: userInfo?._id,
        },
      });
      // console.log("invitaions");

      // console.log(response.data);
      const sortedInvitations = response.data.sort(sortByDate);
      setInvitaions(sortedInvitations);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const getNotifications = async () => {
    if (userRole === "individual") {
      try {
        if (userInfo) {
          // Vérifier si userInfo et organization ne sont pas null
          const response = await axiosInstance.get(
            "/notification/notifications",
            {
              params: {
                recipient: userInfo._id,
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
    } else {
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
    }
  };
  useEffect(() => {
    if (userInfo?._id && userRole) {
      getNotifications();
      getinvitations();
    }
  }, [userInfo, userRole]);
  useEffect(() => {
    if (userInfo?._id && userRole) {
      getNotifications();
      getinvitations();
    }
  }, [reload]);
  useEffect(() => {
    if (userInfo?._id && userRole) {
      getNotifications();
    }
  }, [userInfo, organization, userRole]);

  useEffect(() => {
    if (notifications && invitaions) {
      const notifsNotSeen = (notifications || []).filter(
        (notification) => notification?.seen?.[0]?.seen === false
      );
      console.log("notifNot = ", notifsNotSeen);
      setNbrNotifNot(notifsNotSeen.length);

      const invitsNotSeen = (invitaions || []).filter(
        (invitation) => invitation?.accepted === false
      );
      console.log("invitNot = ", invitsNotSeen);
      setInvitNot(invitsNotSeen.length);

      const total = notifsNotSeen.length + invitsNotSeen.length;
      setNbrNotif(total);
      console.log("nbr notif = ", total);
    }
  }, [notifications, invitaions]);

  const sortByDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

  const locales = ["en", "fr"];
  const localePrefix = "always"; // Default
  const { usePathname } = createSharedPathnamesNavigation({
    locales,
    localePrefix,
  });
  const locale = useLocale();
  const [navigation, setNavigation] = useState([
    { name: "Home", href: `/${locale}`, current: true },
    { name: "Team", href: "#", current: false },
    { name: "Contact", href: `/${locale}/Contact`, current: false },
    { name: "About", href: `/${locale}/About`, current: false },
  ]);
  const [curScreen, setCurScreen] = useState(currentScreen);

  const t = useTranslations("Index");
  const router = useRouter();
  const pathname = usePathname();
  const handleChangeLanguage = (localee) => {
    let loc = "";
    if (locale == "fr") {
      loc = "en";
    } else {
      loc = "fr";
    }
    router.replace(`/${loc + pathname}`);
  };
  const { logout } = useAuth();
  const [activePageIndex, setActivePageIndex] = useState(1);
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
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
      case "delegation":
        router.push(
          `/${locale}/Employee/Task?task=${JSON.stringify(
            JSON.parse(notification?.content?.url)._id
          )}`
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

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <Disclosure style={{ height: "10vh" }} as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="pl-2 pr-4 h-full   flex justify-between items-center">
            {isShowSideBarEmployee ? (
              <div
                onClick={() => setSideBarEmployeeShow(!sideBarEmployeeShow)}
                className="cursor-pointer relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                {sideBarEmployeeShow ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </div>
            ) : null}
            {isShowSideBar ? (
              <div
                onClick={() => setShowSideBar(!showSideBar)}
                className="cursor-pointer relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                {showSideBar ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </div>
            ) : null}
            <div className="  flex max-w-min items-center justify-start sm:items-stretch sm:justify-start">
              {userRole != "orgBoss" ? (
                <Menu
                  as="div"
                  className="z-20 relative sm:ml-4  md:w-6/12 lg:w-3/12 ">
                  <div>
                    <Menu.Button
                      style={{
                        height: "5vh",
                        width:
                          windowSize.width <= 700
                            ? "40vw"
                            : windowSize.width <= 1000
                            ? "40vw"
                            : "30vw",
                      }}
                      className="h-full   flex justify-center items-center px-2 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <MdBusinessCenter className="h-5 w-5 mr-2" />

                      <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">
                        {organization?.Name}
                      </span>
                      <MdArrowDropDown className="h-5 w-5 " />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95">
                    <Menu.Items
                      style={{
                        width:
                          windowSize.width <= 700
                            ? "60vw"
                            : windowSize.width <= 1000
                            ? "40vw"
                            : "30vw",
                      }}
                      className="absolute right-50 z-10 mt-2  origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {/* <<<<<<< HEAD */}
                      {userInfo?.roles?.map((item, index) => {
                        // =======
                        {
                          /* {userInfo?.organizations.map((item, index) => { */
                        }
                        // >>>>>>> 0a7bc172c82c470bedab789337ac3f50e4b0f3a4
                        let textColor = getRandomColor();
                        return (
                          <Menu.Item key={index}>
                            {({ active }) => (
                              <div
                                onClick={async () => {
                                  // <<<<<<< HEAD
                                  const axiosInstance = axios.create({
                                    baseURL:
                                      "http://localhost:1937",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                  });
                                  // =======

                                  // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57
                                  try {
                                    const response = await axiosInstance.get(
                                      "/organization/organizations",
                                      {
                                        params: {
                                          _id:
                                            item.organization._id ||
                                            item.organization,
                                        },
                                      }
                                    );
                                    console.log("organization to dispatch");

                                    console.log(response.data[0]);
                                    // dispatch(setOrganization(response.data[0]));
                                    localStorage.removeItem("organization");
                                    localStorage.setItem(
                                      "organization",
                                      JSON.stringify(response.data[0])
                                    );
                                    localStorage.removeItem("userRole");
                                    localStorage.setItem("userRole", item.role);
                                    console.log("local storage now ");

                                    console.log(
                                      JSON.stringify(
                                        localStorage.getItem("organization")
                                      )
                                    );
                                    console.log("1000");
                                    if (page === "BoardEmployee") {
                                      window.location.reload();
                                    } else {
                                      router.push(
                                        `/${locale}/Employee/BoardEmployee`
                                      );
                                    }
                                    // router.refresh();
                                    // setReloadPage(!reloadPage);
                                    console.log("20000");
                                    setReload(!reload);
                                    // dispatch(setUser(response.data)); // Dispatch action with fetched data
                                  } catch (error) {
                                    console.error("Error:", error);
                                  }
                                  // console.log("organization");
                                  // console.log(item);
                                }}
                                style={{ color: textColor }}
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "cursor-pointer px-4 py-2 text-sm text-gray-700 flex justify-center items-center"
                                )}>
                                <MdBusinessCenter className={`h-5 w-5 mr-2 `} />

                                <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">
                                  {item.organization?.Name}
                                </span>
                              </div>
                            )}
                          </Menu.Item>
                        );
                      })}
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <h1 className="whitespace-nowrap overflow-hidden overflow-ellipsis text-3xl text-white">
                  {organization?.Name}
                </h1>
              )}
            </div>
            <div className=" flex justify-center items-center">
              <button
                href="#"
                className="flex justify-center items-center sm:mr-10 text-sm font-medium underline text-gray-400 hover:no-underline"
                onClick={() => {
                  handleChangeLanguage(locale);
                }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="hidden sm:block w-6 h-6 mr-1">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
                  />
                </svg>

                {locale == "fr" ? "EN" : "FR"}
              </button>
              <div className="  flex items-center pr-2 sm:static sm:inset-auto sm:ml-2 sm:pr-0">
                <Menu as="div" className=" relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">View notifications</span>
                      <div className="relative">
                        <BellIcon
                          color="white"
                          className="h-6 w-6"
                          aria-hidden="true"
                        />
                        {nbrNotif > 0 && (
                          <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {nbrNotif}
                          </span>
                        )}
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95">
                    <Menu.Items
                      style={{
                        right: -50,
                        width: windowSize.width <= 640 ? "90vw" : "60vw",
                        maxHeight: "80vh",
                        minHeight: "60vh",
                      }}
                      className="px-2 flex flex-col items-center costumScrollBar absolute  z-20 mt-2   overflow-y-auto  origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="sticky top-0 z-10 text-black flex  rounded-t-lg bg-white w-full">
                        {/* {pages.map((page, index) => ( */}
                        <p
                          onClick={() => setActivePageIndex(1)}
                          className={`py-2 placeholder:font-semibold cursor-pointer flex-1 border-r-2 border-b-2 flex justify-center items-center ${
                            activePageIndex === 1
                              ? "bg-blue-300 text-white"
                              : ""
                          }`}>
                          Notifications {nbrNotifNot > 0 && `(${nbrNotifNot})`}
                        </p>
                        <p
                          onClick={() => setActivePageIndex(2)}
                          className={`py-2 placeholder:font-semibold cursor-pointer flex-1 border-r-2 border-b-2 flex justify-center items-center ${
                            activePageIndex === 2
                              ? "bg-blue-300 text-white"
                              : ""
                          }`}>
                          Invitations {nbrInvitNot > 0 && `(${nbrInvitNot})`}
                        </p>
                      </div>
                      {/* ))} */}
                      {activePageIndex == 1 ? (
                        <div>
                          <div className="w-full text-sm flex justify-between items-center p-2">
                            <p className="text-black font-semibold text-xl">
                              All notifications ({notifications?.length}) :
                            </p>
                            <a
                              href={`/${locale}/Employee/Notification`}
                              className=" underline text-blue-600 hover:no-underline">
                              View all notifications
                            </a>
                          </div>
                          {notifications?.length > 0 ? (
                            notifications?.map((notification, index) => (
                              <Menu.Item key={index}>
                                {({ active }) => (
                                  <div
                                    onClick={() =>
                                      GotoNotifacations(notification)
                                    }
                                    className={classNames(
                                      !notification.seen[0].seen
                                        ? "bg-blue-300" // Appliquer la classe bg-blue-300 si notification.seen.seen est false
                                        : "bg-gray-100", // Appliquer la classe bg-gray-100 si notification.seen.seen est true
                                      "cursor-pointer NotificationListElement w-full my-2 rounded-xl flex justify-between items-center p-2 border-gray-200 last:border-b-0 last:border-0"
                                    )}>
                                    <div className="flex ">
                                      <div
                                        style={{
                                          minWidth:
                                            windowSize.width <= 450
                                              ? "20vw"
                                              : windowSize.width <= 650
                                              ? "15vw"
                                              : windowSize.width <= 850
                                              ? "12vw"
                                              : "8vw",
                                        }}
                                        className="  flex flex-col justify-center  items-center text-sm font-semibold text-gray-800 ">
                                        {notification.type === "message" && (
                                          <FaRegEnvelope className="" />
                                        )}
                                        {notification.type === "comment" && (
                                          <FaComment className="" />
                                        )}
                                        {notification.type === "reminder" && (
                                          <FaBell className="" />
                                        )}
                                        {notification.type === "project" && (
                                          <FaClipboardList className="" />
                                        )}
                                        {notification.type === "task" && (
                                          <FaTasks className="" />
                                        )}
                                        {notification.type === "team" && (
                                          <FaUserFriends className="" />
                                        )}
                                        {notification.type === "invitation" && (
                                          <FaEnvelopeOpenText className="" />
                                        )}
                                        {notification?.type ===
                                          "delegation" && (
                                          <FaExchangeAlt className="" />
                                        )}
                                        {notification.type}
                                      </div>
                                      <div
                                        style={{
                                          width:
                                            windowSize.width <= 550
                                              ? "50vw"
                                              : windowSize.width <= 850
                                              ? "40vw"
                                              : "50vw",
                                        }}
                                        className="">
                                        <div className="truncate text-sm text-gray-600 mb-2">
                                          {new Date(
                                            notification.createdAt
                                          ).toLocaleString()}
                                        </div>
                                        <div
                                          className={`truncate    text-sm ${
                                            notification.seen.seen
                                              ? "text-gray-600"
                                              : "text-gray-800 font-semibold"
                                          }`}>
                                          {notification.content.message}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  // <a
                                  //   href="#"
                                  //   className={classNames(
                                  //     active ? "bg-gray-100" : "",
                                  //     "block px-4 py-2 text-sm text-gray-700"
                                  //   )}>
                                  //   Your Profile
                                  // </a>
                                )}
                              </Menu.Item>
                            ))
                          ) : (
                            <div className="w-12/12 rounded-sm  my-4 py-2 px-10 text-gray-00 flex justify-center items-center border-gray-600  border-2 border-dashed">
                              your notifications list is emptry
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="w-full text-sm flex justify-between items-start p-2">
                            <p className="text-black font-semibold text-xl">
                              All invitations ({invitaions?.length}) :
                            </p>
                          </div>
                          {invitaions.length > 0 ? (
                            invitaions.map((invitation, index) => (
                              <Menu.Item key={index}>
                                {({ active }) => (
                                  <div
                                    onClick={
                                      () =>
                                        router.push(
                                          `/${locale}/Employee/Invitation?invitation=${JSON.stringify(
                                            invitation
                                          )}`
                                        )

                                      // router.push({
                                      //   pathname: `/${locale}/Employee/Invitation`,
                                      //   // query: {
                                      //   //   invitation:
                                      //   //     JSON.stringify(invitation),
                                      //   // },
                                      // })
                                    }
                                    className={classNames(
                                      !invitation?.accepted
                                        ? "bg-blue-300 cursor-pointer"
                                        : "",

                                      " NotificationListElement  w-full  my-2 rounded-xl flex justify-between items-center p-2   border-gray-200 last:border-b-0 last:border-0"
                                    )}>
                                    <div className="flex ">
                                      <div
                                        style={{
                                          minWidth:
                                            windowSize.width <= 450
                                              ? "20vw"
                                              : windowSize.width <= 650
                                              ? "15vw"
                                              : windowSize.width <= 850
                                              ? "12vw"
                                              : "8vw",
                                        }}
                                        className="  flex flex-col justify-center  items-center text-sm font-semibold text-gray-800 ">
                                        <MdBusinessCenter className="w-6 h-6" />
                                      </div>
                                      <div
                                        style={{
                                          width:
                                            windowSize.width <= 550
                                              ? "50vw"
                                              : windowSize.width <= 850
                                              ? "40vw"
                                              : "50vw",
                                        }}
                                        className="">
                                        <div className="truncate text-sm text-gray-600 mb-2">
                                          {new Date(
                                            invitation.createdAt
                                          ).toLocaleString()}
                                        </div>
                                        <div
                                          className={`truncate    text-sm ${
                                            invitation?.accepted
                                              ? "text-gray-600"
                                              : "text-gray-800 font-semibold"
                                          }`}>
                                          Vous avez été invité(e) par{" "}
                                          {invitation.sendby.prenom}{" "}
                                          {invitation.sendby.nom} à rejoindre
                                          l'organisation "
                                          {invitation.organisation.Name}" dans
                                          notre application de gestion des
                                          tâches.
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Menu.Item>
                            ))
                          ) : (
                            <div className="w-12/12 rounded-sm  my-4 py-2 px-10 text-gray-00 flex justify-center items-center border-gray-600  border-2 border-dashed">
                              your invitaions list is emptry
                            </div>
                          )}
                        </div>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href={`/${locale}/Employee/ProfileSettings`}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              " px-4 py-2 text-sm text-gray-700 flex justify-start items-center"
                            )}>
                            <IoSettings className="h-6 w-6 mr-2" />
                            <span> Settings</span>
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <p
                            onClick={async () => {
                              await logout();
                              // await signOut(auth);

                              // router.push("/");
                            }}
                            // href=""
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              " px-4 py-2 text-sm text-gray-700 flex justify-start items-center cursor-pointer"
                            )}>
                            <IoLogOutSharp className="h-6 w-6 mr-2" />
                            <span>Sign out</span>
                          </p>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
            {/* </div> */}
          </div>
        </>
      )}
    </Disclosure>
  );
}

export default NavBarAuth;
