// Chat.js
import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
// import { useParams } from 'react-router-dom';
// In your main or entry file (e.g., index.js or App.js)
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Chat.css';


library.add(faPaperPlane);


function Chat() {
  const [selectedUser, setSelectedUser] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const ws = useRef(null);
  const chatboxRef = useRef(null);
  const navigate = useNavigate();
  const currentDate = new Date();
  const [enterMessage, setEnterMessage] = useState('');

  //--------------------------------------------------------------------------------------------------------------------------------

  const startWebSocket = useCallback(() => {
    const accessToken = sessionStorage.getItem('access_token');
    const username = sessionStorage.getItem('username');
    const base_url = process.env.REACT_APP_BASE_URL;
    if (accessToken && username) {
      const socketUrl = `ws://${base_url}/chat/${username}`;

      ws.current = new WebSocket(socketUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connection opened');
      };

      ws.current.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        const eventData = event.data;
        const jsonData = JSON.parse(eventData);

        console.log(jsonData);
        // Gelen mesajı mesajı değerlendir, tipine bak
        if (jsonData.type == "message") {
          const newMessage = {
            id: Date.now(),
            sender: jsonData.content.sender, // Mesaj gelen kişiyi seçtiğimiz kişi olarak ayarla
            message_text: jsonData.content.message,
            sent_at: jsonData.content.sent_at,
          };

          if (selectedUser === newMessage.sender) {
            setMessageHistory((prevHistory) => [...prevHistory, newMessage]);
          }
        }
        // user ile ilgili birşey olduysa değerlendir ve yap
        if (jsonData.type == "user_event") {
          fetchUsers();
          fetchActiveUsers();
        }

      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }
  }, [selectedUser, setMessageHistory, ws]);

  const sendMessage = (selectedUser, enterMessage) => {
    // Check if the WebSocket is open
    if (ws.current && ws.current.readyState === WebSocket.OPEN && selectedUser != '') {

      const formattedDate = currentDate.toLocaleString();

      // Construct the payload to be sent as JSON
      const payload = {
        'receiver': selectedUser,
        'message': enterMessage,
        'sent_at': formattedDate,
      };
      console.log(payload)

      // Send the payload as a JSON string through the WebSocket
      ws.current.send(JSON.stringify(payload));

      // Gelen mesajı messageHistory'e ekle
      const newMessage = {
        id: Date.now(),
        sender: currentUserName, // Mesaj gelen kişiyi seçtiğimiz kişi olarak ayarla
        message_text: enterMessage,
        sent_at: formattedDate,
      };

      setMessageHistory((prevHistory) => [...prevHistory, newMessage]);
      setEnterMessage('');
    }
  };

  const fetchUsers = async () => {
    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `http://${base_url}/users`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setTimeout(() => {
          navigate(`/login`);
        }, 500);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error || 'Bir hata yaşandı', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => {
        navigate(`/login`);
      }, 500);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `http://${base_url}/active_user`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveUsers(data.active_users);
      } else {
        setTimeout(() => {
          navigate(`/login`);
        }, 500);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error || 'Bir hata yaşandı', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate(`/login`);
      }, 500);
    }
  };

  const fetchMessageHistory = async (otherUser) => {
    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `http://${base_url}/chat/${otherUser}/history`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessageHistory(data.history || []);
      } else {
        setTimeout(() => {
          navigate(`/login`);
        }, 500);
      }

    } catch (error) {
      console.error('Error fetching message history:', error);
      toast.error(error || 'Bir hata yaşandı', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate(`/login`);
      }, 500);
    }
  };

  const logout = async () => {
    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `http://${base_url}/logout`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });

      sessionStorage.setItem('access_token', NaN);
      sessionStorage.setItem('username', NaN);

      toast.success('Çıkış başarılı', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => {
        navigate(`/login`);
      }, 0);

    } catch (error) {

      sessionStorage.setItem('access_token', NaN);
      sessionStorage.setItem('username', NaN);
      toast.success('Çıkış başarılı', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate(`/login`);
      }, 0);
    }
  };

  //--------------------------------------------------------------------------------------------------------------------------------


  const handleEnterKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      // Check if there's a selected user and a message to send
      if (selectedUser && enterMessage.trim() !== '') {
        sendMessage(selectedUser, enterMessage);

        // Clear the input field after sending the message
        setEnterMessage('');
      }
    }
  }


  //--------------------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    // Session storage'dan değeri al
    const access_token = sessionStorage.getItem('access_token'); // access_token'i kendi anahtarınızla değiştirin
    const username = sessionStorage.getItem('username');

    // Eğer değer boşsa, "login" sayfasına yönlendir
    if (!access_token || !username) {

      toast.error('Önce giriş yapınız', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => {
        navigate(`/login`);
      }, 500);
    }

  }, [navigate]);


  useEffect(() => {
    // Kullanıcı listesini çek
    setCurrentUserName(sessionStorage.getItem('username'))
    fetchUsers();
    fetchActiveUsers();
  }, []);

  useEffect(() => {
    // Kullanıcı değiştikçe yeni kullanıcı ile olan mesaj geçmişini çek
    if (selectedUser) {
      fetchMessageHistory(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    // Scroll to the bottom of the chatbox__row_fullheight element when component mounts or messageHistory changes
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  });

  useEffect(() => {
    // WebSocket bağlantısını başlat

    startWebSocket();
    fetchUsers();
    fetchActiveUsers();

    // Component unmount edildiğinde WebSocket bağlantısını kapat
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [startWebSocket]);


  return (
    <div class="modal">
      <div class="modal__dialog">
        <div class="modal__close">
          <a href="#" class="modal__icon">
            <i class="fa fa-times" aria-hidden="true"></i>
          </a>
          <button
            className="logout-button"
            onClick={() => logout()}
          >
            Exit
          </button>
        </div>

        <div class="modal__content chat">
          <div class="modal__sidebar">
            <div class="chat__search search">
              <div class="search">
                <div class="search__icon">
                  <i class="fa fa-search" aria-hidden="true"></i>
                </div>
                <input type="search" class="search__input" placeholder=""></input >
                <div class="search__icon search__icon_right">
                  <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                </div>
              </div>
            </div>

            <div class="chat__users chat__users_fullheight ">
              <div class="users">
                {users.map((user) => (
                  <li class="users__item"
                    key={user}
                    onClick={() => setSelectedUser(user)}
                    style={{
                      backgroundColor: selectedUser === user ? '#a3a3a3' : '',
                    }}
                  >
                    <div className={`users__avatar avatar ${activeUsers.includes(user) ? 'avatar_online' : ''}`}>
                      <a href="#" class="avatar__wrap">
                        {user[0].toUpperCase()}
                      </a>
                    </div>
                    <span class="users__note"> {user}</span>
                    <div class="counter"></div>
                  </li>
                ))}
              </div>
            </div>

            <div class="me__content">
              <div class="me_head">
                <div class="head__avatar avatar_me avatar_larger">
                  <a href="#" class="avatar__wrap">
                    Me:
                  </a>
                </div>
                <div class="me_title">{currentUserName}</div>
              </div>
            </div>
          </div>

          <div class="modal__main">
            <div class="chatbox">
              <div class="chatbox__row">
                <div class="head">
                  <div class="head__avatar avatar avatar_larger">
                    <a href="#" class="avatar__wrap">
                      {selectedUser ? `${selectedUser[0].toUpperCase()}` : '?'}
                    </a>
                  </div>
                  <div class="head__title">{selectedUser ? `${selectedUser}` : ''}</div>
                </div>
              </div>
              <div class="chatbox__row chatbox__row_fullheight" ref={chatboxRef}>
                <div class="chatbox__content">
                  {messageHistory.map((message) => (
                    <div className="message" key={message.id}>
                      <div className="message__head">
                        <span className="message__note">
                          {message.sender === currentUserName ? message.sent_at : message.sender}
                        </span>
                      </div>
                      <div className={`message__base ${message.sender === currentUserName ? 'sent' : 'received'}`}>
                        <div className="message__avatar avatar">
                          <a href="#" className="avatar__wrap">
                            {message.sender[0].toUpperCase()}
                          </a>
                        </div>
                        <div className="message__textbox">
                          <span className="message__text">{message.message_text}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div class="chatbox__row">
                <div class="enter">
                  <div class="enter__submit">
                    <button class="button button_id_submit" type="button" onClick={() => sendMessage(selectedUser, enterMessage)}>
                      <FontAwesomeIcon icon="paper-plane" /> send
                    </button>
                  </div>
                  <div class="enter__textarea">
                    <textarea name="enterMessage"
                      id="enterMessage"
                      cols="30"
                      rows="2"
                      placeholder="..."
                      value={enterMessage}
                      onChange={(e) => setEnterMessage(e.target.value)}
                      onKeyDown={handleEnterKeyDown}>
                    </textarea>
                  </div>
                  <div class="enter__icons">
                    <a href="#" class="enter__icon">
                      <i class="fa fa-paperclip" aria-hidden="true"></i>
                    </a>
                    <a href="#" class="enter__icon">
                      <i class="fa fa-smile-o" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Chat;
