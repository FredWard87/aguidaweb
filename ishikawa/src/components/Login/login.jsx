import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './css/Login.css';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [Correo, setEmail] = useState('');
    const [Contraseña, setPassword] = useState('');
    const [Nombre, setName] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { 
            Correo, 
            Contraseña, 
            ...(isRegister && { Nombre }) // Solo agregar el nombre si es registro
        };
        const url = isRegister
            ? `${process.env.REACT_APP_BACKEND_URL}/usuarios`
            : `${process.env.REACT_APP_BACKEND_URL}/login`;

        try {
            const response = await axios.post(url, data);
            console.log(response.data);

            if (!isRegister) {
                const userData = response.data.user || response.data; // Asegúrate de acceder al objeto correcto
                const nombreUsuario = userData.Nombre || 'Usuario'; // Accede al nombre del usuario
                Swal.fire({
                    title: 'Bienvenido',
                    text: `Hola ${nombreUsuario}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    navigate('/ishikawavacio');
                });
            } else {
                Swal.fire({
                    title: 'Registro Exitoso',
                    text: 'Usuario registrado exitosamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error('Hubo un error:', error.response ? error.response.data : error.message);
            Swal.fire({
                title: 'Error',
                text: error.response ? error.response.data : error.message,
                icon: 'error',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h2>{isRegister ? 'Registrar' : 'Iniciar sesión'}</h2>
                {isRegister && (
                    <div className="input-container">
                        <label>Nombre</label>
                        <input
                            type="text"
                            value={Nombre}
                            onChange={(e) => setName(e.target.value)}
                            required={isRegister}
                        />
                    </div>
                )}
                <div className="input-container">
                    <label>Correo electrónico</label>
                    <input
                        type="email"
                        value={Correo}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-container">
                    <label>Contraseña</label>
                    <input
                        type="password"
                        value={Contraseña}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{isRegister ? 'Registrar' : 'Iniciar sesión'}</button>
                <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                >
                    {isRegister ? 'Cambiar a Iniciar sesión' : 'Cambiar a Registrar'}
                </button>
            </form>
        </div>
    );
};

export default Login;
