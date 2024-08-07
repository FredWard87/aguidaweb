import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { UserContext } from './App';
import {jwtDecode} from 'jwt-decode';

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/verifyToken`, { token });
          setUserData({ ...response.data, token });
        } else {
          setUserData(null);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setUserData(null);
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    if (userData && userData.token) {
      const decodedToken = jwtDecode(userData.token);
      const expirationTime = decodedToken.exp * 1000;
      
      const checkSession = () => {
        const currentTime = Date.now();
        const timeRemaining = expirationTime - currentTime;

        if (timeRemaining < 10 * 60 * 1000 && timeRemaining > 0) { // Menos de 10 minutos
          Swal.fire({
            title: 'Advertencia',
            text: 'Su sesión está a punto de expirar.',
            icon: 'warning',
            timer: 2000,
            showConfirmButton: false,
          });
        }

        if (timeRemaining <= 0) {
          localStorage.removeItem('token');
          setUserData(null);
          window.location.href = '/'; // Redirige al usuario a la página de inicio
        }
      };

      // Verifica cada minuto
      const interval = setInterval(checkSession, 60 * 1000);

      // Limpia el intervalo cuando el componente se desmonte
      return () => clearInterval(interval);
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export default AuthProvider;
