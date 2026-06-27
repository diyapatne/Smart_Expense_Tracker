// src/pages/UploadReceipt.jsx
import { useState } from "react";
import axiosInstance from "../api/axios";
import Spinner from "../components/LoadingSpinner";

const CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Transport",
  "Utilities",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
];

export default function UploadReceipt() {
  // ---- State ----
  const [file, setFile] = useState(null);          // the actual File object
  const [previewUrl, setPreviewUrl] = useState(null); // local image preview URL
  const [isDragging, setIsDragging] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [receiptId, setReceiptId] = useState(null);
  const [formData, setFormData] = useState(null); // extracted + editable fields

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ---- Handlers: file selection ----
  function handleFileSelect(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file (jpg, png, etc.)");
      return;
    }

    setError("");
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    // reset any previous results if user picks a new file
    setFormData(null);
    setReceiptId(null);
    setSuccessMsg("");
  }

  function handleInputChange(e) {
    handleFileSelect(e.target.files[0]);
  }

  // ---- Drag and drop handlers ----
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }

  // ---- Upload + Analyze flow ----
  async function handleUploadAndAnalyze() {
    if (!file) {
      setError("Please choose a receipt image first.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Step 1: Upload the image
      const uploadForm = new FormData();
      uploadForm.append("file", file);
        const uploadRes = await axiosInstance.post(
        "/receipts/upload",
        uploadForm,
        {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        }
        );

        console.log(uploadRes.data);

        const newReceiptId = uploadRes.data.receipt_id;
      setReceiptId(newReceiptId);
      setUploading(false);

      // Step 2: Automatically trigger AI analysis
      setAnalyzing(true);
      const analyzeRes = await axiosInstance.post(
        `/receipts/${newReceiptId}/analyze`
      );

      // Expecting something like:
      // { merchant_name, receipt_date, total_amount, category, items }
      const extracted = analyzeRes.data;

      // Normalize items so every item always has { name, price },
      // regardless of whether the AI returned strings or objects.
      const normalizedItems = (extracted.items || []).map((item) => {
        if (typeof item === "string") {
          return { name: item, price: "" };
        }
        return {
          name: item.name ?? "",
          price: item.price ?? "",
        };
      });

      setFormData({
        merchant_name: extracted.merchant_name || "",
        receipt_date: extracted.receipt_date || "",
        total_amount: extracted.total_amount ?? "",
        category: extracted.category || CATEGORIES[CATEGORIES.length - 1],
        items: normalizedItems,
      });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Something went wrong while uploading or analyzing the receipt."
      );
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  // ---- Editable form change handler ----
  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // ---- Item-level editing ----
  function updateItem(index, field, value) {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  }

  function removeItem(index) {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  // ---- Confirm: save final expense ----
  async function handleConfirm() {
    if (!formData) return;

    setError("");
    try {
      const cleanedItems = (formData.items || []).map((item) => ({
        name: item.name,
        price: Number(item.price) || 0,
      }));

      console.log(formData);
      await axiosInstance.post("/expenses/", {
        merchant_name: formData.merchant_name,
        category: formData.category,
        amount: Number(formData.total_amount),
        expense_date: formData.receipt_date || null,
        notes: null,
        description: null,
        items: cleanedItems,
      });

      setSuccessMsg("Expense saved successfully!");
      // reset everything for next upload
      setFile(null);
      setPreviewUrl(null);
      setFormData(null);
      setReceiptId(null);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to save expense. Please try again."
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Receipt</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm">
          {successMsg}
        </div>
      )}

      {/* ---- Drag & Drop Zone ---- */}
      {!formData && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <p className="text-gray-600">
            Drag & drop a receipt image here, or{" "}
            <span className="text-blue-600 underline">click to choose</span>
          </p>
        </div>
      )}

      {/* ---- Image Preview ---- */}
      {previewUrl && !formData && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Receipt preview"
            className="max-h-80 mx-auto rounded shadow"
          />
          <button
            onClick={handleUploadAndAnalyze}
            disabled={uploading || analyzing}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload & Analyze"}
          </button>
        </div>
      )}

      {/* ---- Loading Spinner ---- */}
      {(uploading || analyzing) && (
        <Spinner label={uploading ? "Uploading receipt..." : "AI is reading your receipt..."} />
      )}

      {/* ---- Editable Form (after AI analysis) ---- */}
      {formData && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Review & Correct Details</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Merchant Name</label>
            <input
              type="text"
              value={formData.merchant_name}
              onChange={(e) => handleFieldChange("merchant_name", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Receipt Date</label>
            <input
              type="date"
              value={formData.receipt_date}
              onChange={(e) => handleFieldChange("receipt_date", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => handleFieldChange("total_amount", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ---- Editable Items List ---- */}
          {formData.items?.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Items (from AI)</label>
              <div className="space-y-2">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                      placeholder="Item name"
                      className="flex-[2] border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(idx, "price", e.target.value)}
                      placeholder="Price"
                      className="flex-1 border rounded px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 text-sm font-bold"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleConfirm}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}