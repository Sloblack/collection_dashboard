export default function PageHeader({ title, description, buttonText, secondaryButtons, icon }) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {buttonText && (
            <button className={`w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700`}>
              {buttonText}
            </button>
          )}
          
          {secondaryButtons?.map((btn, index) => (
            <button 
              key={index} 
              className={`w-full sm:w-auto ${btn.color} text-white px-4 py-2 rounded-lg`}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    );
  }