import React, { useEffect, useState } from "react";
import Button from "./Button";
import axios from "axios";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activeLeaderboard, setActiveLeaderboard] = useState("all-time"); // all-time, today, longest-runs
  useEffect(() => {
    fetchLeaderboardData(activeLeaderboard);
  }, [activeLeaderboard]);
  const fetchLeaderboardData = async (category) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/leaderboard/${category}`
      );
      setLeaderboardData(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      // Handle error state appropriately
    }
  };
  return (
    <div className={`leaderboardContainer`}>
      <div className={`tabs`}>
        <button
          className={activeLeaderboard === "all-time" ? "activeTab" : ""}
          onClick={() => setActiveLeaderboard("all-time")}
        >
          ALL TIME
        </button>
        <button
          className={activeLeaderboard === "today" ? "activeTab" : ""}
          onClick={() => setActiveLeaderboard("today")}
        >
          TODAY
        </button>
        <button
          className={activeLeaderboard === "longest-runs" ? "activeTab" : ""}
          onClick={() => setActiveLeaderboard("longest-runs")}
        >
          LONGEST RUNS
        </button>
      </div>

      <ul className="leaderboardList">
        {leaderboardData.map((entry, index) => (
          <li key={index} className="leaderboardEntry">
            <div className="avatar">{/* Placeholder for user avatar */}</div>
            <div className="username">
              {/* Replace with actual username */}
              User: {entry.userId}
            </div>
            <div className="score">Total NEWEN: {entry._sum.amount}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
