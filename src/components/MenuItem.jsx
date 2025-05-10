import * as LucideIcons from 'lucide-react' // Helper para importar iconos dinámicamente

export default function MenuItem({ icon, text, active, onClick }) {
    const IconComponent = LucideIcons[icon];
    
    return (
        <li>
          <button
            onClick={onClick}
            className={`flex items-center w-full p-3 rounded-lg text-left ${
              active ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className={`${active ? 'text-green-600' : 'text-gray-500'}`}>{icon}</span>
            <span className="ml-3">{text}</span>
          </button>
        </li>
      );
  }