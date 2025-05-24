import Dashboard from './components/Dashboard';
import { authService } from './services/api';
import { useState, useEffect } from 'react';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          console.log('Token encontrado'); // Para depuración
          const currentUser = authService.getCurrentUser();
          console.log('Usuario actual:', currentUser); // Para depuración
          if (currentUser && authService.isAdmin()) {
            console.log('Usuario autenticado como administrador'); // Para depuración
            setUser(currentUser);
          } else {
            console.log('Usuario no es administrador o no está autenticado'); // Para depuración
            authService.logout();
          }
        } else {
          console.log('No se encontró token'); // Para depuración
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (loggedInUser) => {
    console.log('Usuario logueado:', loggedInUser); // Para depuración
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
