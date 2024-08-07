import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate si lo usas aquí
import { UserContext } from '../../App';
import './css/login.css';
import logo from '../assets/img/logoAguida.png';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LoginForm = () => {
  const [formData, setFormData] = useState({ Correo: '', Contraseña: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUserData } = useContext(UserContext);
  const navigate = useNavigate(); // Mantén el useNavigate aquí para redirección

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, formData);
      const { token, usuario } = response.data;

      if (usuario.TipoUsuario !== 'Administrador') {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'Solo los administradores pueden iniciar sesión.',
        });
        return;
      }

      localStorage.setItem('token', token);
      setUserData(usuario);

      navigate('/home'); // Redirige al usuario a la página de inicio
    } catch (error) {
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      console.error(error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='login-container-all'>
      <div className="login-container">
        <div className="form-group">
          <div className='espacio'>
            <img src={logo} alt="Logo Empresa" className="logo-empresa-login" />
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="Correo"></label>
            <input
              type="email"
              name="Correo"
              value={formData.Correo}
              onChange={handleChange}
              placeholder="Correo electrónico"
              required
            />
          </div>
          <div className="form-group password-group">
            <label htmlFor="Contraseña"></label>
            <input
              type={showPassword ? "text" : "password"}
              name="Contraseña"
              value={formData.Contraseña}
              onChange={handleChange}
              placeholder="Contraseña"
              required
            />
            <span className="password-toggle-icon" onClick={toggleShowPassword}>
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <button type="submit" className="btn-login">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
