import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

const DashboardPage = () => {
  const { allUserWritings } = useUser();
  const [daysWithWritings, setDaysWithWritings] = useState(new Map());

  console.log("all the users writings are: ", allUserWritings);
  const ankyverseStart = new Date("2023-08-10T05:00:00-04:00").getTime();
  const secondSojournStart = new Date("2023-12-05T05:00:00-04:00").getTime();

  useEffect(() => {
    const writingsPerDay = new Map();

    allUserWritings.forEach((writing) => {
      const timestamp = parseInt(writing.timestamp);
      const dayDifference = Math.floor(
        (timestamp - secondSojournStart) / (1000 * 60 * 60 * 24)
      );
      writingsPerDay.set(
        dayDifference,
        (writingsPerDay.get(dayDifference) || 0) + 1
      );
    });

    setDaysWithWritings(writingsPerDay);
  }, [allUserWritings]);

  const daysSinceStart = Array.from(
    { length: (Date.now() - secondSojournStart) / (1000 * 60 * 60 * 24) },
    (_, index) => index
  );

  return (
    <div className="text-white h-fit w-screen flex flex-row flex-wrap">
      {daysSinceStart.map((day) => {
        const hasWriting = daysWithWritings.has(day);
        const backgroundColor = hasWriting ? "bg-green-200" : "bg-red-200";

        return (
          <div
            key={day}
            className={`w-12 h-12 text-xl m-2 p-2 flex items-center justify-center text-black rounded-xl ${backgroundColor}`}
          >
            {day + 1}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardPage;
