// Signup.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Signup.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  // const location = useLocation(); // useLocation hook'unu ekleyin

  const handleSignup = async () => {
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
        toast.success('Signup successful!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Başarılı kayıt olduktan sonra 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate(`/login?username=${username}`); // Kullanıcı adını parametre olarak ekleyin
        }, 2000);
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Signup failed.', {
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
      toast.error('Signup failed.', {
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
    <div className="signup-container">
      <h2>Signup</h2>
      <ToastContainer />
      <form className="signup-form">
        <label>
          Kullanıcı Adı:
        </label>
        <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adınızı girin"
          />
        <label>
          Şifre:
        </label>
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrenizi girin"
          />
        <button type="button" onClick={handleSignup}>
          Signup
        </button>
      </form>
      <p>
        Zaten hesabınız var mı?{' '}
        <Link to="/login">Giriş yapın</Link>
      </p>
    </div>
  );
}

export default Signup;
