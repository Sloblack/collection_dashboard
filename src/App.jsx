import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { authService } from './services/api';
import DashboardOverview from './components/DashboardOverview';
import UsersManagement from './components/UsersManagement';
import ContainersManagement from './components/ContainersManagement';
import RoutesManagement from './components/RoutesManagement';
import CollectionsManagement from './components/CollectionsManagement';
import CollectionPointsManagement from './components/CollectionPointsManagement';
import Login from './components/Login';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (loggedInUser) =>{
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user = {user} onLogout = {handleLogout} />;
}

export default App;
