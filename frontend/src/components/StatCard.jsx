const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 h-24 flex flex-col justify-between hover:shadow-md transition">

      <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">
        {title}
      </h3>

      <p className="text-2xl font-bold text-blue-600">
        {value}
      </p>

    </div>
  );
};

export default StatCard;

// src/components/StatCar