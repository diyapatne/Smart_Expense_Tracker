

import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import StatCard from "../components/StatCard";

import {
    Bar,
    Doughnut,
    Line
} from "react-chartjs-2";

export default function Dashboard() {

    const [summary, setSummary] = useState({
        total_spent: 0,
        this_month: 0,
        avg_per_day: 0,
        total_receipts: 0,
    });

    const [monthlyData, setMonthlyData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);

    useEffect(() => {
        fetchSummary();
        fetchMonthly();
        fetchCategory();
        fetchWeekly();
        fetchRecent();
    }, []);

    async function fetchSummary() {
        const res = await axiosInstance.get("/analytics/summary");
        setSummary(res.data);
    }

    async function fetchMonthly() {
        const res = await axiosInstance.get("/analytics/monthly");
        setMonthlyData(res.data);
    }

    async function fetchCategory() {
        const res = await axiosInstance.get("/analytics/by-category");
        setCategoryData(res.data);
    }

    async function fetchWeekly() {
        const res = await axiosInstance.get("/analytics/weekly");
        setWeeklyData(res.data);
    }

    async function fetchRecent() {
        const res = await axiosInstance.get("/analytics/recent");
        setRecentExpenses(res.data);
    }

    const monthlyChart = {
        labels: monthlyData.map((item) => item.month),

        datasets: [
            {
                label: "Monthly Spending (₹)",
                data: monthlyData.map((item) => item.total),

                backgroundColor: "#3B82F6",
            },
        ],
    };

    const categoryChart = {
        labels: categoryData.map((item) => item.category),

        datasets: [
            {
                data: categoryData.map((item) => item.total),

                backgroundColor: [
                    "#3B82F6",
                    "#22C55E",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                    "#14B8A6",
                ],
            },
        ],
    };

    const weeklyChart = {
        labels: weeklyData.map((item) => item.day),

        datasets: [
            {
                label: "Daily Spending",

                data: weeklyData.map((item) => item.total),

                borderColor: "#3B82F6",

                backgroundColor: "#3B82F6",

                tension: 0.4,
            },
        ],
    };

    return (
  <div className="min-h-screen bg-gray-100 p-6">

    {/* Heading */}
    <h1 className="text-3xl font-bold mb-6">
      Analytics Dashboard
    </h1>

    {/* Stat Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      <StatCard
        title="Total Spent"
        value={`₹${summary.total_spent}`}
      />

      <StatCard
        title="This Month"
        value={`₹${summary.this_month}`}
      />

      <StatCard
        title="Average / Day"
        value={`₹${summary.avg_per_day}`}
      />

      <StatCard
        title="Total Receipts"
        value={summary.total_receipts}
      />

    </div>

    {/* Charts */}
    <div className="grid lg:grid-cols-2 gap-6">

      {/* Monthly Spending */}
      <div className="bg-white rounded-xl shadow p-5">

        <h2 className="text-lg font-semibold mb-4">
          Monthly Spending
        </h2>

        <div className="h-72">
          <Bar
            data={monthlyChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow p-5">

        <h2 className="text-lg font-semibold mb-4">
          Category Breakdown
        </h2>

        <div className="h-72">
          <Doughnut
            data={categoryChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>

      </div>

    </div>

    {/* Weekly Spending */}
    <div className="bg-white rounded-xl shadow mt-6 p-5">

      <h2 className="text-lg font-semibold mb-4">
        Weekly Spending
      </h2>

      <div className="h-72">
        <Line
          data={weeklyChart}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>

    </div>

    {/* Recent Transactions */}
    <div className="bg-white rounded-xl shadow mt-6 p-5">

      <h2 className="text-lg font-semibold mb-4">
        Recent Transactions
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Date</th>

              <th className="p-3 text-left">Merchant</th>

              <th className="p-3 text-left">Category</th>

              <th className="p-3 text-right">Amount</th>

            </tr>

          </thead>

          <tbody>

            {recentExpenses.map((expense, index) => (

              <tr
                key={index}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3">
                  {expense.date}
                </td>

                <td className="p-3">
                  {expense.merchant}
                </td>

                <td className="p-3">
                  {expense.category}
                </td>

                <td className="p-3 text-right font-semibold text-blue-600">
                  ₹{expense.amount}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  </div>
);
}
