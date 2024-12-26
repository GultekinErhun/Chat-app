import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Signup.css';

// SVG ikon komponenti
function SignupIcon() {
  return (
    <svg 
      className="signup-icon"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function Signup() {
  // State tanımlamaları
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Signup işlemi için handleSignup fonksiyonu
  const handleSignup = async () => {
    // Boş alan kontrolü
    if (!username || !password) {
      toast.error('You have to pass your username and password', {
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

    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `http://${base_url}/signup`;

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

      if (response.ok) {
        toast.success('Kayıt işlemi başarılı!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // 2 saniye bekleyip login sayfasına yönlendir
        setTimeout(() => {
          navigate(`/login?username=${username}`);
        }, 2000);
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Kayıt işlemi başarısız.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.', {
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

  // Enter tuşu ile kayıt olma
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div className="signup-container">
      <div className="logo-container">
        <img src="./logo.jpeg" alt="Logo" className="login-logo" />
        <div className="app-name">Chat-Sever</div>
      </div>
      <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          username:
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your username"
          autoComplete="username"
        />
        <label>
          Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your password"
          autoComplete="new-password"
        />
        <div className="signup-button-container" onClick={handleSignup}>
          <SignupIcon />
        </div>
      </form>
      <p>
        Do you have already an account?{' '}
        <Link to="/login">Login</Link>
      </p>
      <ToastContainer />
    </div>
  );
}

export default Signup;