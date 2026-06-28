
// import { useEffect, useState } from "react";
// import axiosInstance from "../api/axios";
// import StatCard from "../components/StatCard";
// import { Bar } from "react-chartjs-2";
// const Dashboard = () => {
//   const [summary, setSummary] = useState({
//     total_spent: 0,
//     this_month: 0,
//     avg_per_day: 0,
//     total_receipts: 0,
//   });

//   const [loading, setLoading] = useState(true);

//   const [monthlyData, setMonthlyData] = useState([]);


//   useEffect(() => {
//   fetchSummary();
//   fetchMonthlyData();
// }, []);


//   const fetchMonthlyData = async () => {
//   try {
//     const response = await axiosInstance.get("/analytics/monthly");

//     console.log(response.data);

//     setMonthlyData(response.data);
//   } catch (error) {
//     console.error("Monthly API Error:", error);
//   }
// };
// const monthlyChartData = {
//   labels: monthlyData.map((item) => item.month),

//   datasets: [
//     {
//       label: "Monthly Spending (₹)",
//       data: monthlyData.map((item) => item.total),

//       backgroundColor: "#3b82f6",
//       borderRadius: 8,
//     },
//   ],
// };
//   const fetchSummary = async () => {
//     try {
//       const response = await axiosInstance.get("/analytics/summary");

//       setSummary(response.data);
//     } catch (error) {
//       console.error("Error fetching dashboard summary:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-8 text-center text-lg">
//         Loading Dashboard...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">

//       <h1 className="text-3xl font-bold mb-8">
//         Analytics Dashboard
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

//         <StatCard
//           title="Total Spent"
//           value={`₹${summary.total_spent}`}
//         />

//         <StatCard
//           title="This Month"
//           value={`₹${summary.this_month}`}
//         />

//         <StatCard
//           title="Avg / Day"
//           value={`₹${summary.avg_per_day}`}
//         />

//         <StatCard
//           title="Total Receipts"
//           value={summary.total_receipts}
//         />

//       </div>
//       <div className="mt-10 bg-white rounded-xl shadow-md p-6">

//   <h2 className="text-2xl font-bold mb-6">
//     Monthly Spending
//   </h2>

//   <Bar
//     data={monthlyChartData}
//     options={{
//         responsive: true,

//         plugins: {
//             legend: {
//                 position: "top",
//             },
//         },

//         scales: {
//             y: {
//                 beginAtZero: true,
//             },
//         },
//     }}
// />
// </div>

//     </div>
//   );
// };

// export default Dashboard;

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
        <div className="min-h-screen bg-gray-100 p-8">

            <h1 className="text-4xl font-bold mb-8">
                Analytics Dashboard
            </h1>

            <div className="grid md:grid-cols-4 gap-6">

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

            <div className="grid lg:grid-cols-2 gap-8 mt-10">

                <div className="bg-white p-6 rounded-xl shadow">

                    <h2 className="text-xl font-bold mb-4">
                        Monthly Spending
                    </h2>

                    <Bar
                        data={monthlyChart}
                        options={{
                            responsive: true,
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

                <div className="bg-white p-6 rounded-xl shadow">

                    <h2 className="text-xl font-bold mb-4">
                        Category Breakdown
                    </h2>

                    <Doughnut
                        data={categoryChart}
                    />

                </div>

            </div>

            <div className="bg-white rounded-xl shadow mt-10 p-6">

                <h2 className="text-xl font-bold mb-6">
                    Weekly Spending
                </h2>

                <Line
                    data={weeklyChart}
                    options={{
                        responsive: true,
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

            <div className="bg-white rounded-xl shadow mt-10 p-6">

                <h2 className="text-xl font-bold mb-6">
                    Recent Transactions
                </h2>

                <table className="w-full border">

                    <thead className="bg-gray-200">

                        <tr>

                            <th className="p-3 border">Date</th>

                            <th className="p-3 border">Merchant</th>

                            <th className="p-3 border">Category</th>

                            <th className="p-3 border">Amount</th>

                        </tr>

                    </thead>

                    <tbody>

                        {recentExpenses.map((expense, index) => (

                            <tr key={index}>

                                <td className="border p-3">
                                    {expense.date}
                                </td>

                                <td className="border p-3">
                                    {expense.merchant}
                                </td>

                                <td className="border p-3">
                                    {expense.category}
                                </td>

                                <td className="border p-3">
                                    ₹{expense.amount}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}
