import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import loginIcon from './logo.jpeg'; // Login ikonunuzun yolunu ekleyin

function LoginIcon() {
  return (
    <svg 
      className="login-icon"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const location = useLocation();
  const history = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const usernameParam = searchParams.get('username');
    const accessTokenParam = searchParams.get('accessToken');

    setUsername(usernameParam || '');
    setAccessToken(accessTokenParam || '');
  }, [location.search]);

  const handleLogin = async () => {
    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `http://${base_url}/login`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.status === 401) {
        toast.error('Invalid username or password', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      const data = await response.json();

      setUsername(data.user_name);
      setAccessToken(data.access_token);
      sessionStorage.setItem('username', data.user_name);
      sessionStorage.setItem('access_token', data.access_token);
      history('/chat');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src="./logo.jpeg" alt="Logo" className="login-logo" />
        <h1 className="app-name">Chat-Sever</h1>
      </div>
      <h2>Login</h2>
      <ToastContainer />
      <form className="login-form">
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <div className="login-button-container" onClick={handleLogin}>
          <LoginIcon />
        </div>
      </form>
      <p>
        Don't have an account?<Link to="/signup">Create an account.</Link>
      </p>
      {accessToken && <p>Erişim Tokeni: {accessToken}</p>}
    </div>
  );
}

export default Login; 