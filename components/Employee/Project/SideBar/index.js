import React from "react";
import { Fragment, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import "./style.css";
import { useRouter } from "next/navigation";

import { Disclosure, Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import {
  UserGroupIcon,
  ServerIcon,
  CalendarIcon,
  ChartSquareBarIcon,
  CogIcon,
} from "@heroicons/react/outline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SideBarProject({ currentPage }) {
  const locale = useLocale();
  const router = useRouter();

  const [navigation, setNavigation] = useState([
    { name: "Kanban", href: "#", current: 0 },
    { name: "Timeline", href: "#", current: false },
    { name: "Board", href: "#", current: false },
    { name: "About", href: "#", current: false },
  ]);
  return (
    <div
      style={{ height: "90vh" }}
      className="sideBarContainer flex justify-between   flex-col w-32">
      <div>
        <div className="py-4  flex justify-center items-center">
          <img
            className="h-14 w-auto"
            src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
            alt="Your Company"
          />
        </div>
        <ul className=" flex justify-between   flex-col text-l ">
          <li
            onClick={() => router.push(`/${locale}/Employee/Project/Board`)}
            className={`flex justify-center cursor-pointer items-center flex-col
                py-4  ${
                  currentPage == "Board"
                    ? "border-purple-500 text-purple-500 font-bold border-l-4"
                    : "text-gray-500"
                }  `}>
            <img
              src="/images/dashboard.png"
              alt="dashboard"
              className="w-8 h-8"
            />
            Board
          </li>
          <li
            onClick={() => router.push(`/${locale}/Employee/Project/Scheduler`)}
            className={`flex justify-center cursor-pointer items-center flex-col
                py-4  ${
                  currentPage == "Scheduler"
                    ? "border-purple-500 text-purple-500 font-bold border-l-4"
                    : "text-gray-500"
                }  `}>
            <img
              src="/images/timeline.png"
              alt="timeline"
              className="w-7 h-7"
            />
            Scheduler
          </li>
          <li
            onClick={() => router.push(`/${locale}/Employee/Project/Kanban`)}
            className={`flex justify-center cursor-pointer items-center flex-col
                py-4  ${
                  currentPage == "Kanban"
                    ? "border-purple-500 text-purple-500 font-bold border-l-4"
                    : "text-gray-500"
                }  `}>
            <img
              src="/images/planning.png"
              alt="planning"
              className="w-7 h-7"
            />
            Kanban
          </li>
        </ul>
      </div>
      <li
        className="flex justify-center items-center flex-col
                py-4 text-gray-500 mt-auto ">
        <img src="/images/gear.png" alt="gear" className="w-7 h-7" />
        Settings
      </li>
    </div>
  );
}

export default SideBarProject;
