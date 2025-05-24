import { useState } from 'react';
import { Search, Trash2, Users, Map, Route, Box, BarChart2, Bell, Menu, X, LogOut, CircleX } from 'lucide-react';
import MenuItem from './MenuItem';
import DashboardOverview from './DashboardOverview';
import UsersManagement from './UsersManagement';
import ContainersManagement from './ContainersManagement';
import RoutesManagement from './RoutesManagement';
import CollectionsManagement from './CollectionsManagement';
import getPageTitle from './shared/getPageTitle';

export default function Dashboard({ user, onLogout }) {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const handleLogout = () => {
    onLogout();
  };
  
  const renderContent = () => {
    switch(selectedMenu) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <UsersManagement />;
      case 'containers':
        return <ContainersManagement />;
      case 'routes':
        return <RoutesManagement />;
      case 'collections':
        return <CollectionsManagement />;
      default:
        return <DashboardOverview />;
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar Mobile Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 text-gray-600 focus:outline-none"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative flex flex-col w-64 h-screen bg-white border-solid transition-transform duration-300 ease-in-out z-10`}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-stone-300">
          <h2 className="text-xl font-bold text-green-600">Recolección de residuos</h2>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <MenuItem
              icon={<BarChart2 size={20} />}
              text="Dashboard"
              active={selectedMenu === 'dashboard'}
              onClick={() => setSelectedMenu('dashboard')}
            />
            <MenuItem
              icon={<Users size={20} />}
              text="Usuarios"
              active={selectedMenu === 'users'}
              onClick={() => setSelectedMenu('users')}
            />
            <MenuItem
              icon={<Trash2 size={20} />}
              text="Contenedores"
              active={selectedMenu === 'containers'}
              onClick={() => setSelectedMenu('containers')}
            />
            <MenuItem
              icon={<Route size={20} />}
              text="Rutas"
              active={selectedMenu === 'routes'}
              onClick={() => setSelectedMenu('routes')}
            />
            <MenuItem
              icon={<Box size={20} />}
              text="Recolecciones"
              active={selectedMenu === 'collections'}
              onClick={() => setSelectedMenu('collections')}
            />
          </ul>
        </nav>
        
        <div className="p-4 border-t border-stone-300">
          <ul>
            <MenuItem
              icon = {<LogOut size={20} />}
              text="Cerrar sesión"
              active={false}
              onClick={handleLogout}
            />
          </ul>
            
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="flex-shrink-0 flex flex-col md:flex-row items-center justify-between p-3 h-16 bg-white border-b border-stone-300 gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-xl font-semibold text-center md:text-left">{getPageTitle(selectedMenu)}</h1>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
          </div>

          <div className="p-4 border-t border-stone-300">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="ml-3">
              <p className="font-medium">{user.nombre}</p>
              <p className="text-xs text-gray-500"></p>
            </div>
            
          </div>
        </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
