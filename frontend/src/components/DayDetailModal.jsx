// src/components/DayDetailModal.jsx

export default function DayDetailModal({ dayData, onClose }) {
  if (!dayData) return null;

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

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">
            {new Date(dayData.date).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Total spent:{" "}
          <span className="font-semibold text-gray-800">
            ₹{dayData.total.toFixed(2)}
          </span>
        </p>

        <p className="text-sm text-gray-500">

Status:

<span className="font-semibold">

{

dayData.color==="green"

? "🟢 Within Budget"

: dayData.color==="yellow"

? "🟡 Near Budget"

: dayData.color==="red"

? "🔴 Over Budget"

: "⚪ No Spending"

}

</span>

</p>

        {dayData.expenses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No expenses recorded on this day.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {dayData.expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex justify-between items-center border-b last:border-0 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {exp.merchant_name || "Unknown"}
                  </p>

                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      exp.category
                    )}`}
                  >
                    {exp.category}
                  </span>
                </div>

                <p className="font-semibold text-gray-700">
                  ₹{Number(exp.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}