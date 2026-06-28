const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border">
      <h3 className="text-gray-500 text-sm font-medium">
        {title}
      </h3>

      <p className="text-3xl font-bold text-blue-600 mt-2">
        {value}
      </p>
    </div>
    
  );
};

export default StatCard;


// src/components/StatCar