import { useEffect, useState } from "react";
import { format } from "date-fns";
import axiosInstance from "../api/axios";
import { Link } from "react-router-dom";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
  fetchExpenses();
}, [page, category, startDate, endDate]);

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get("/expenses", {
  params: {
    page,
    limit: 10,
    category: category || undefined,
    start: startDate || undefined,
    end: endDate || undefined,
  },
  
});

      // Handle both paginated and plain array responses
if (Array.isArray(response.data)) {
  // Backend returned a plain array
  setExpenses(response.data);
  setTotalPages(1);
} else {
  // Backend returned paginated data
  setExpenses(response.data.items || []);
  setTotalPages(response.data.pages || 1);
}
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg">
        Loading expenses...
      </div>
    );
  }
const filteredExpenses = expenses.filter((expense) =>
  (expense.merchant_name || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);
const getCategoryColor = (category) => {
  switch (category) {
    case "Food":
      return "bg-green-100 text-green-700";

    case "Transport":
      return "bg-blue-100 text-blue-700";

    case "Medical":
      return "bg-red-100 text-red-700";

    case "Shopping":
      return "bg-purple-100 text-purple-700";

    case "Entertainment":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};
 const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure?");
 
    if (!confirmed) return;
 
    try {
      await axiosInstance.delete(`/expenses/${id}`);
 
      const wasLastItemOnPage = expenses.length === 1;
 
      if (wasLastItemOnPage && page > 1) {
        setPage((prev) => prev - 1); // useEffect will re-fetch automatically
      } else {
        await fetchExpenses(); // refresh current page from server
      }
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };
  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Expense Management
      </h1>
      <div className="flex gap-4 mb-6">

  <div>
    <label className="block text-sm mb-1">
      Start Date
    </label>

    <input
      type="date"
      value={startDate}
      onChange={(e) => {
  setStartDate(e.target.value);
  setPage(1);
}}
      className="border rounded-lg px-3 py-2"
    />
  </div>

  <div>
    <label className="block text-sm mb-1">
      End Date
    </label>

    <input
      type="date"
      value={endDate}
      onChange={(e) => {
  setEndDate(e.target.value);
  setPage(1);
}}
      className="border rounded-lg px-3 py-2"
    />
  </div>

</div>
<div className="mb-6">
  <input
    type="text"
    placeholder="Search by merchant..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
<div className="mb-4">
  <select
  value={category}
  onChange={(e) => {
    setCategory(e.target.value);
    setPage(1);
  }}
  className="border rounded-lg px-4 py-2"
>
    <option value="">All Categories</option>
    <option value="Food">Food</option>
    <option value="Transport">Transport</option>
    <option value="Medical">Medical</option>
    <option value="Shopping">Shopping</option>
    <option value="Entertainment">Entertainment</option>
    <option value="Other">Other</option>
  </select>
</div>
      <table className="w-full border border-gray-200 shadow-sm rounded-lg overflow-hidden">

        <thead className="bg-blue-50">

          <tr>
            <th className="border-b px-4 py-3">Date</th>
            <th className="border-b px-4 py-3">Merchant</th>
            <th className="border-b px-4 py-3">Category</th>
            <th className="border-b px-4 py-3">Amount</th>
            <th className="border-b px-4 py-3">Actions</th>
          </tr>

        </thead>

        <tbody>

          {filteredExpenses.map((expense) => (

            <tr key={expense.id}>

              <td className="border p-3">
                {format(
                  new Date(expense.expense_date),
                  "dd MMM yyyy"
                )}
              </td>

              <td className="border p-3">
                {expense.merchant_name}
              </td>

              <td className="border p-3">
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                    expense.category
                    )}`}
                >
                    {expense.category}
                </span>
                </td>

              <td className="border p-3">
                ₹ {expense.amount}
              </td>

              <td className="border p-3">
                <div className="flex gap-2">

  <Link
    to={`/edit-expense/${expense.id}`}
    className="text-blue-600 hover:underline"
  >
    Edit
  </Link>

  <button
  onClick={() => handleDelete(expense.id)}
  className="text-red-600 hover:underline"
>
Delete
</button>

</div>
              </td>

            </tr>

          ))}

        </tbody>

      </table>
<div className="flex items-center justify-between mt-6">

  <button
  onClick={() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }}
  disabled={page === 1}
  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
>
  Previous
</button>

  <span className="font-medium">
    Page {page} of {totalPages}
  </span>

  <button
  onClick={() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }}
  disabled={page === totalPages}
  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
>
  Next
</button>

</div>
    </div>
  );
}