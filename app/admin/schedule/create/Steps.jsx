import { translations } from "./utils/translations";



const Steps = ({ current, items, t }) => {
  return (
    <div className="flex justify-between items-center w-full">
      {items.map((item, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= current
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm ${
                index <= current ? "text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              {t.steps[item.title]}
            </span>
          </div>
          {index < items.length - 1 && (
            <div
              className={`flex-1 h-px mx-4 ${
                index < current ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Steps;