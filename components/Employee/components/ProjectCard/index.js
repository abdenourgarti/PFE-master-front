import React from "react";
import Link from "next/link";
import "./style.css";
import { useRouter } from "next/navigation";

import { useTranslations, useLocale } from "next-intl";

function ProjectCard({ project }) {
  const locale = useLocale();
  const router = useRouter();
  const doneTasks = project.tasks.filter((task) => task.status === "Done");
  return (
    <div
      onClick={async () => {
        const projectInfo = localStorage.getItem("project");
        if (projectInfo) {
          localStorage.removeItem("project");
        }

        await localStorage.setItem("project", JSON.stringify(project));
        router.push(`/${locale}/Employee/Project/Board`);
      }}
      className=" min-w-56 max-w-56 min-h-44 max-h-44  projectCard rounded-xl px-2 pt-4 pb-1 m-4 flex flex-col cursor-pointer  justify-between ">
      <div className="flex ">
        <img
          className="h-8 mr-2 mt-2 w-auto"
          src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
          alt="Your Company"
        />
        <div>
          <p className="font-bold">{project?.Name}</p>
          <p className="text-sm">{`Boss ${project?.boss?.nom} ${project?.boss?.prenom}`}</p>
          <h3 className=" mt-2 mb-1 text-sm text-gray-400">QUICK divS</h3>
          <div className="flex text-xs justify-between">
            <p>My open issues</p>
            <p>{project?.tasks?.length - doneTasks?.length}</p>
          </div>
          <div className="flex text-xs justify-between">
            <p>Done issues</p>
            <p>{doneTasks?.length}</p>
          </div>
        </div>
      </div>
      <div className=" w-full flex flex-col items-center">
        <div className="border-2 w-5/6"></div>
        <button
          onClick={async () => {
            const projectInfo = localStorage.getItem("project");
            if (projectInfo) {
              localStorage.removeItem("project");
            }

            await localStorage.setItem("project", JSON.stringify(project));
            router.push(`/${locale}/Employee/Project/Board`);
          }}
          // href={`/${locale}/Employee/Project/Board`}
          className="mt-1 text-blue-700 hover:underline cursor-pointer">
          {" "}
          Details
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
