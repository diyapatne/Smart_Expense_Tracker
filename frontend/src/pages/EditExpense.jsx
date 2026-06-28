import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    merchant_name: "",
    category: "",
    amount: "",
    expense_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchExpense();
  }, []);

  const fetchExpense = async () => {
    try {
      const response = await axiosInstance.get(`/expenses/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load expense.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.put(`/expenses/${id}`, formData);
      alert("Expense updated successfully!");
      navigate("/expenses");
    } catch (error) {
      console.error(error);
      alert("Failed to update expense.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="merchant_name"
          value={formData.merchant_name}
          onChange={handleChange}
          placeholder="Merchant"
          className="w-full border rounded p-2"
        />

        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="w-full border rounded p-2"
        />

        <input
          type="date"
          name="expense_date"
          value={formData.expense_date}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Medical">Medical</option>
          <option value="Shopping">Shopping</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notes"
          className="w-full border rounded p-2"
        />

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Save Changes
        </button>

      </form>
    </div>
  );
}