// administrador/src/context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const decodedToken = jwtDecode(token);
            const expirationTime = decodedToken.exp * 1000;
            const currentTime = Date.now();

            const timeRemaining = expirationTime - currentTime;

            if (timeRemaining < 10 * 60 * 1000) { // 10 minutes in milliseconds
                Swal.fire({
                    title: 'Advertencia',
                    text: 'Su sesión está a punto de expirar.',
                    icon: 'warning',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

            const interval = setInterval(() => {
                const currentTime = Date.now();
                const timeRemaining = expirationTime - currentTime;

                if (timeRemaining < 10 * 60 * 1000) {
                    Swal.fire({
                        title: 'Advertencia',
                        text: 'Su sesión está a punto de expirar.',
                        icon: 'warning',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                }

                if (timeRemaining <= 0) {
                    clearInterval(interval);
                    localStorage.removeItem('token');
                    setToken(null);
                    navigate('/login');
                }
            }, 60 * 1000); // Check every minute

            return () => clearInterval(interval);
        }
    }, [token, navigate]);

    return (
        <AuthContext.Provider value={{ token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};
