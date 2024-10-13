import React, { useEffect, useState } from "react";
import axios from "axios";

function UserCard({
  userCardInfo,
  teamId,
  showUserCard,
  setShowUserCard,
  organization,
}) {
  const [user, setuser] = useState({});
  const [todoTasks, setTodoTasks] = useState([]);
  const [inprogressTasks, setInProgressTasks] = useState([]);
  const [inreviewTasks, setInReviewTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const filterTasks = (tasks) => {
    setTodoTasks(tasks.filter((task) => task.status === "Todo"));
    setInProgressTasks(tasks.filter((task) => task.status === "Inprogress"));
    setInReviewTasks(tasks.filter((task) => task.status === "Inreview"));
    setDoneTasks(tasks.filter((task) => task.status === "Done"));
  };
  useEffect(() => {
    const fetchUserTasks = async () => {
      const axiosInstance = axios.create({
        baseURL: "http://localhost:1937",
        headers: {
          "Content-Type": "application/json",
        },
      });
      try {
        const tasksResponse = await axiosInstance.get(`/user/userTasks`, {
          params: {
            userId: userCardInfo?._id,
            organizationId: organization?._id,
            teamId: teamId,
          },
        });
        const tasks = tasksResponse.data;
        // setAllTasks(tasks);
        filterTasks(tasks);
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
      }
    };

    fetchUserTasks();
  }, []);

  //   const [showUserCard, setshowUserCard] = useState(true);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(2px)",
        backgroundColor: "rgba(255, 255, 255, 0)",
      }}
      className={` fixed inset-0 z-50  overflow-y-auto justify-center items-center flex `}>
      <div
        style={{ width: "50vw" }}
        className="myShadow relative mx-auto max-h-[80vh] overflow-auto   rounded-lg shadow-md bg-white">
        {/* <div className="   px-5 border-b border-gray-200"> */}
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-white">
          <button
            type="button"
            onClick={() => setShowUserCard(false)}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-500 focus:outline-none">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="white">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10L4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="bg-gradient-to-r  from-blue-500 to-teal-500 p-6 flex flex-col items-center">
            {/* <div className=""> */}
            <button className="bg-white text-2xl rounded-full h-20 w-20 flex items-center justify-center mb-4 shadow-md">
              {userCardInfo?.nom[0]?.toUpperCase()}{" "}
              {userCardInfo?.prenom[0]?.toUpperCase()}
            </button>
            {/* </div> */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                {userCardInfo?.nom} {userCardInfo?.prenom}
              </h2>
              <p className="text-white opacity-75">{userCardInfo?.email} </p>
            </div>
          </div>
          <div className="flex flex-row  justify-center min-w-full">
            <div className="flex flex-col sm:flex-row justify-around w-full  bg-gray-100  overflow-hidden  shadow-md">
              <div className="text-center bg-white  w-full sm:w-1/2 py-4 px-2">
                <div className="text-sm font-medium text-gray-600 ">To Do</div>
                <div className="text-2xl font-bold text-blue-600">
                  {todoTasks?.length}
                </div>
                <div className="text-sm flex  items-center font-medium text-gray-600 justify-around mt-2 ">
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        todoTasks?.filter((task) => task?.priorite === "A")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">A</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        todoTasks?.filter((task) => task?.priorite === "B")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">B</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        todoTasks?.filter((task) => task?.priorite === "C")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">C</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        todoTasks?.filter((task) => task?.priorite === "D")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">D</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        todoTasks?.filter((task) => task?.priorite === "E")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">E</div>
                  </div>
                </div>
              </div>
              <div className="text-center bg-slate-400  w-full sm:w-1/2  py-4 px-2">
                <div className="text-sm font-medium text-white">
                  In Progress
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {inprogressTasks?.length}
                </div>
                <div className="text-sm flex  items-center font-medium text-gray-600 justify-around mt-2 ">
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inprogressTasks?.filter(
                          (task) => task?.priorite === "A"
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">A</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inprogressTasks?.filter(
                          (task) => task?.priorite === "B"
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">B</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inprogressTasks?.filter(
                          (task) => task?.priorite === "C"
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">C</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inprogressTasks?.filter(
                          (task) => task?.priorite === "D"
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">D</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inprogressTasks?.filter(
                          (task) => task?.priorite === "E"
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">E</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-around  w-full bg-gray-100 overflow-hidden  shadow-md">
              <div className="text-center bg-slate-400 sm:bg-white w-full sm:w-1/2 py-4 px-2">
                <div className="text-sm font-medium text-white sm:text-gray-600">
                  In Review
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {inreviewTasks?.length}
                </div>
                <div className="text-sm flex  items-center font-medium text-gray-600 justify-around mt-2 ">
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inreviewTasks?.filter((task) => task?.priorite === "A")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">A</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inreviewTasks?.filter((task) => task?.priorite === "B")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">B</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inreviewTasks?.filter((task) => task?.priorite === "C")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">C</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inreviewTasks?.filter((task) => task?.priorite === "D")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">D</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        inreviewTasks?.filter((task) => task?.priorite === "E")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-gray-600">E</div>
                  </div>
                </div>
              </div>
              <div className="text-center bg-white sm:bg-slate-400 w-full sm:w-1/2 py-4 px-2">
                <div className="text-sm font-medium text-gray-600 sm:text-white">
                  Done
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {doneTasks?.length}
                </div>
                <div className="text-sm flex  items-center font-medium text-gray-600 justify-around mt-2 ">
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        doneTasks?.filter((task) => task?.priorite === "A")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">A</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        doneTasks?.filter((task) => task?.priorite === "B")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">B</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        doneTasks?.filter((task) => task?.priorite === "C")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">C</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        doneTasks?.filter((task) => task?.priorite === "D")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">D</div>
                  </div>{" "}
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {
                        doneTasks?.filter((task) => task?.priorite === "E")
                          .length
                      }
                    </div>
                    <div className="text-sm font-medium text-white">E</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* </div> */}
      </div>
    </div>
  );
}

export default UserCard;
