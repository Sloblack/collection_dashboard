import { useState } from 'react';
import { authService } from '../services/api';

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    telefono: '',
    contrasenia: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authService.login(credentials);
      if (response.user.rol === 'administrador') {
        // Administrador
        onLogin(response.user);
      }
      else {
        setError('No tienes permisos para acceder a esta sección.');
        authService.logout();
      }
    } catch (error) {
      setError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tus credenciales para acceder
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  className="focus:ring-green-500 focus:border-green-500 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 sm:text-sm"
                  placeholder="1234567890"
                  value={credentials.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="contrasenia" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="contrasenia"
                name="contrasenia"
                type="password"
                required
                className="focus:ring-green-500 focus:border-green-500 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 sm:text-sm"
                placeholder="••••••••"
                value={credentials.contrasenia}
                onChange={handleChange}
              />
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
  
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            >
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}