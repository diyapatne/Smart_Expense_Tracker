// src/pages/SpendingCalendar.jsx
import { useState, useEffect, useCallback } from "react";
import { startOfMonth, getDay, format } from "date-fns";
import axiosInstance from "../api/axios";
import DayDetailModal from "../components/DayDetailModal";
import Spinner from "../components/LoadingSpinner";

const COLOR_CLASSES = {
  purple: "bg-gray-50 text-gray-400 border-gray-200",

  green:
    "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",

  orange:
    "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200",

  red:
    "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
};
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SpendingCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // JS months are 0-indexed, our API is 1-indexed

  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDay, setSelectedDay] = useState(null);   // currently open modal data
  const [dayLoading, setDayLoading] = useState(false);

  // ===========================================================
  // Fetch the month's calendar data whenever year/month changes
  // ===========================================================
  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/analytics/calendar", {
        params: { year, month },
      });
      setCalendarData(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load calendar data.");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // ===========================================================
  // Month navigation
  // ===========================================================
  function goToPreviousMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // ===========================================================
  // Handle clicking a specific day
  // ===========================================================
  async function handleDayClick(dateStr, total) {
    if (total === 0) return; // nothing to show for empty days, skip the modal

    setDayLoading(true);
    try {
      const res = await axiosInstance.get(`/analytics/day/${dateStr}`);
      setSelectedDay(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load that day's details.");
    } finally {
      setDayLoading(false);
    }
  }

  // ===========================================================
  // Build the calendar grid — pad the start with empty cells so
  // the 1st of the month lands on the correct weekday column
  // ===========================================================
  function buildGrid() {
    if (!calendarData) return [];

    const firstOfMonth = startOfMonth(new Date(year, month - 1, 1));
    const startWeekday = getDay(firstOfMonth); // 0 = Sunday, 6 = Saturday

    const cells = [];
    // Leading blank cells before day 1
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }
    // Actual days
    calendarData.days.forEach((day) => cells.push(day));

    return cells;
  }

  const gridCells = buildGrid();
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Spending Calendar</h1>
        {calendarData && (

<div className="grid grid-cols-3 gap-4 mb-6">

<div className="bg-blue-50 rounded-lg p-4">

<p className="text-sm text-gray-500">
Monthly Budget
</p>

<p className="font-bold text-xl">
₹{calendarData.monthly_budget}
</p>

</div>

<div className="bg-green-50 rounded-lg p-4">

<p className="text-sm text-gray-500">
Daily Budget
</p>

<p className="font-bold text-xl">
₹{calendarData.daily_budget}
</p>

</div>

<div className="bg-purple-50 rounded-lg p-4">

<p className="text-sm text-gray-500">
Average Spend
</p>

<p className="font-bold text-xl">
₹{calendarData.avg_per_day}
</p>

</div>
<div className="bg-orange-50 rounded-xl shadow p-5">
  <p className="text-sm text-gray-500">
    Spent This Month
  </p>

  <p className="text-3xl font-bold text-orange-700">
    ₹{calendarData.month_spent}
  </p>
</div>
<div className="bg-green-50 rounded-xl shadow p-5">
  <p className="text-sm text-gray-500">
    Remaining Budget
  </p>

  <p className="text-3xl font-bold text-green-700">
    ₹{calendarData.remaining_budget}
  </p>
</div>
</div>

)}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* ---- Month navigation ---- */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
        >
          ← Prev
        </button>
        <h2 className="font-semibold text-gray-800">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
        >
          Next →
        </button>
      </div>

      {/* ---- Legend ---- */}
      <div className="flex gap-4 mb-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded-full bg-gray-300"></span>
        No Spending
    </span>

    <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded-full bg-green-300"></span>
        Within Budget
    </span>

    <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded-full bg-yellow-300"></span>
        Near Budget
    </span>

    <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded-full bg-red-300"></span>
        Over Budget
    </span>
        
      </div>

      {loading ? (
        <Spinner label="Loading calendar..." />
      ) : (
        <>
          {/* ---- Weekday header row ---- */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdayLabels.map((label) => (
              <div key={label} className="text-center text-xs font-medium text-gray-400">
                {label}
              </div>
            ))}
          </div>

          {/* ---- Calendar grid ---- */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((cell, idx) => {
              if (cell === null) {
                return <div key={`empty-${idx}`} />;
              }

              const colorClass = COLOR_CLASSES[cell.color];
              const isClickable = cell.total > 0;

              return (
                <button
                  key={cell.date}
                  onClick={() => handleDayClick(cell.date, cell.total)}
                  disabled={!isClickable}
                  className={`aspect-square rounded-lg border text-xs flex flex-col items-center justify-center transition ${colorClass} ${
                    isClickable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="font-medium">{cell.day}</span>
                  {cell.total > 0 && (
                    <span className="text-[10px] mt-0.5">₹{Math.round(cell.total)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {dayLoading && (
        <p className="text-center text-sm text-gray-400 mt-4">Loading day details...</p>
      )}

      <DayDetailModal dayData={selectedDay} onClose={() => setSelectedDay(null)} />
    </div>
  );
}