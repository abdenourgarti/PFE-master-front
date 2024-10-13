"use client";
import React, { useState, useEffect } from "react";
import "./style.css";
import { IoSearchCircle } from "react-icons/io5";
import axios from "axios";
import UserCard from "../userCard";

function TeamPage() {
  const axiosInstance = axios.create({
    baseURL: "https://pfe-master-backend.vercel.app",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const [team, setTeam] = useState({});
  const [teamId, setTeamId] = useState(null);
  const [people, setPeople] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [org, setOrg] = useState({});
  useEffect(() => {
    console.log("local storage");
    if (typeof window !== "undefined") {
      const userinfo = localStorage.getItem("userInfo");
      const orga = localStorage.getItem("organization");
      if (userinfo && orga) {
        let userJson = JSON.parse(userinfo);
        console.log("userJson");
        console.log(userJson);
        setUserInfo(userJson);
        let orgaJson = JSON.parse(orga);
        console.log("orgaJson");
        console.log(orgaJson);
        setOrg(orgaJson);
        const team = userJson?.team.find(
          (obj) => obj.Organization === orgaJson._id
        );
        console.log("team");
        console.log(team);

        setTeamId(team?._id);
      }
    }
  }, []);

  // =======

  useEffect(() => {
    const getTeams = async (values) => {
      try {
        const response = await axiosInstance.get("/team/teams", {
          params: {
            _id: teamId,
          },
        });
        console.log("team from database");

        console.log(response.data[0]);
        setTeam(response.data[0]);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    if (teamId) {
      getTeams();
    }
  }, [teamId]);
  useEffect(() => {
    const getTeamMembers = async () => {
      try {
        const response = await axiosInstance.get("/user/users", {
          params: {
            team: teamId,
          },
        });
        console.log("people");

        console.log(response.data);
        setPeople(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    if (teamId) {
      getTeamMembers();
    }
  }, [teamId]);

  const [showUserCard, setShowUserCard] = useState(false);
  const [userCardInfo, setUserCardInfo] = useState({});
  return (
    <div
      style={{ height: "90vh" }}
      className=" pt-10 lg:px-10 px-4   w-full overflow-auto costumScrollBar">
      <div className="bg-white   ">
        <div className="  w-full  mb-6 pr-4 flex justify-between items-center">
          <h1 className="sm:text-2xl text-xl font-bold    ">{team?.Name} :</h1>
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center">
          {team?.Boss ? (
            <div className="bg-gray-800 w-fit h-fit lg:mr-6 mb-4  rounded-lg flex flex-col items-center justify-center py-20 px-4 sm:px-10 ">
              <button className="h-20 w-20 text-3xl relative flex justify-center items-center rounded-full bg-orange-800  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
              {team?.Boss?.nom[0].toUpperCase()}{" "}
              {team?.Boss?.prenom[0].toUpperCase()}
              </button>
              <h5 className="mb-1 text-center text-xl font-medium text-gray-900 dark:text-white">
                
              {team?.Boss?.nom} {team?.Boss?.prenom}
                
              </h5>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Team Leader
              </span>
              <div className="text-white">{team?.Boss?.email}</div>
            </div>
          ) : null}

          <ul
            style={{ height: "73vh" }}
            role="list"
            className="w-full overflow-auto costumScrollBar grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
            {people?.map((person, index) => (
              <li key={index}>
                <div className="flex items-center gap-x-6">
                  <button
                    onClick={() => {
                      setUserCardInfo(person);
                      setShowUserCard(true);
                    }}
                    className="h-10 w-10 relative flex justify-center items-center rounded-full bg-orange-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    
                    {person?.nom[0].toUpperCase()}{" "}
                    {person?.prenom[0].toUpperCase()}
                  </button>
                  <div>
                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
                      {person?.nom} {person?.prenom}
                      
                    </h3>
                    <p className="text-sm font-semibold leading-6 text-indigo-600">
                      {person?.email}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {showUserCard ? (
          <UserCard
            teamId={teamId}
            userCardInfo={userCardInfo}
            showUserCard={showUserCard}
            setShowUserCard={setShowUserCard}
          />
        ) : null}
      </div>
    </div>
  );
}

export default TeamPage;
