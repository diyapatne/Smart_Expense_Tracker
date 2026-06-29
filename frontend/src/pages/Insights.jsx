import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const Insights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadCachedInsights = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get("/insights");

            setData(response.data);
            setError("");
        } catch (err) {
            if (err.response?.status === 404) {
                setError("No insights found. Generate them first.");
            } else {
                setError("Unable to load insights.");
            }
        } finally {
            setLoading(false);
        }
    };

    const generateInsights = async () => {
        try {
            setRefreshing(true);

            const response = await axiosInstance.post(
                "/insights/generate"
            );

            setData(response.data);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Failed to generate insights."
            );
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCachedInsights();
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center">
                Loading insights...
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">

            <div className="flex justify-between items-center mb-8">

                <h1 className="text-3xl font-bold">
                    AI Financial Insights
                </h1>

                <button
                    onClick={generateInsights}
                    disabled={refreshing}
                    className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {refreshing
                        ? "Generating..."
                        : "Refresh Insights"}
                </button>

            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-5">
                    {error}
                </div>
            )}

            {data && (
                <>
                    <div className="grid md:grid-cols-3 gap-5">

                        {data.insights.map((item, index) => (

                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md p-5"
                            >

                                <div className="text-3xl mb-3">

                                    {index === 0 && "📈"}
                                    {index === 1 && "💰"}
                                    {index === 2 && "⚠️"}

                                </div>

                                <h2 className="font-bold text-lg mb-2">
                                    {item.title}
                                </h2>

                                <p className="text-gray-600">
                                    {item.description}
                                </p>

                            </div>

                        ))}

                    </div>

                    <div className="mt-8 bg-green-100 rounded-lg p-5">

                        <h2 className="font-bold text-xl mb-3">
                            💡 Savings Tip
                        </h2>

                        <p>
                            {data.savings_tip}
                        </p>

                    </div>

                    <div className="mt-6 bg-yellow-100 rounded-lg p-5">

                        <h2 className="font-bold text-xl mb-3">
                            ⚠ Spending Flag
                        </h2>

                        <p>
                            {data.flag}
                        </p>

                    </div>

                    <div className="mt-8 text-gray-500 text-sm">

                        Last Updated:

                        {" "}

                        {new Date(
                            data.created_at
                        ).toLocaleString()}

                    </div>

                </>
            )}

        </div>
    );
};

export default Insights;