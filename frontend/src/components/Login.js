// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const location = useLocation();
  const history = useNavigate(); // useNavigate hook'unu ekleyin

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const usernameParam = searchParams.get('username');
    const accessTokenParam = searchParams.get('accessToken');

    // Parametrede kullanıcı adı ve erişim tokeni varsa ayarlayın
    setUsername(usernameParam || '');
    setAccessToken(accessTokenParam || '');
  }, [location.search]);

  const handleLogin = async () => {
    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `${base_url}/login`;

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

      // Kullanıcı adı ve erişim tokeni bilgilerini kaydet
      setUsername(data.user_name);
      setAccessToken(data.access_token);
      sessionStorage.setItem('username', data.user_name);
      sessionStorage.setItem('access_token', data.access_token);
      // Başarılı giriş işlemi sonrasında "chat" sayfasına yönlendir
      history('/chat');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <ToastContainer />
      <form className="login-form">
        <label>
          Kullanıcı Adı:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adınızı girin"
          />
        </label>
        <label>
          Şifre:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrenizi girin"
          />
        </label>
        <button type="button" onClick={handleLogin}>
          Login
        </button>
      </form>
      <p>
        Hesabınız yok mu?{' '}
        <Link to="/signup">Hesap oluşturun</Link>
      </p>
      {/* Eğer accessToken varsa, göster */}
      {accessToken && (
        <p>
          Erişim Tokeni: {accessToken}
        </p>
      )}
    </div>
  );
}

export default Login;
