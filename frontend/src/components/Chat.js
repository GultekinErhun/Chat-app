// Chat.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// In your main or entry file (e.g., index.js or App.js)
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Chat.css';


library.add(faPaperPlane);


function Chat() {
  const [selectedUser, setSelectedUser] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const ws = useRef(null);


  useEffect(() => {
    // Kullanıcı listesini çek
    setCurrentUserName(localStorage.getItem('username'))
    fetchUsers();
  }, []);

  useEffect(() => {
    // Kullanıcı değiştikçe yeni kullanıcı ile olan mesaj geçmişini çek
    if (selectedUser) {
      fetchMessageHistory(selectedUser);
    }
  }, [selectedUser]);

  const startWebSocket = useCallback(() => {
    const accessToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    // const base_url = process.env.REACT_APP_BASE_URL;

    if (accessToken && username) {
      const socketUrl = `ws://localhost:8000/chat/${username}`;

      ws.current = new WebSocket(socketUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connection opened');
      };

      ws.current.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        const eventData = event.data;
        const jsonData = JSON.parse(eventData);

        // Gelen mesajı messageHistory'e ekle
        const newMessage = {
          id: Date.now(),
          sender: jsonData.sender, // Mesaj gelen kişiyi seçtiğimiz kişi olarak ayarla
          message_text: jsonData.message,
        };
        
        if (selectedUser === newMessage.sender){
          setMessageHistory((prevHistory) => [...prevHistory, newMessage]);
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

  useEffect(() => {
    // WebSocket bağlantısını başlat

    startWebSocket();

    // Component unmount edildiğinde WebSocket bağlantısını kapat
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [startWebSocket]);

  const fetchUsers = async () => {
    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `${base_url}/users`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessageHistory = async (otherUser) => {
    try {
      const base_url = process.env.REACT_APP_BASE_URL;
      const url = `${base_url}/chat/${otherUser}/history`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await response.json();
      setMessageHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching message history:', error);
    }
  };
  
  const [enterMessage, setEnterMessage] = useState('');

  const handleEnterKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey){
      event.preventDefault();
       // Check if there's a selected user and a message to send
      if (selectedUser && enterMessage.trim() !== '') {
        sendMessage(selectedUser, enterMessage);

        // Clear the input field after sending the message
        setEnterMessage('');
      }
    }
  }

  const sendMessage = (selectedUser, enterMessage) => {
    // Check if the WebSocket is open
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {

      // Construct the payload to be sent as JSON
      const payload = {
        'receiver': selectedUser,
        'message': enterMessage,
      };
      console.log(payload)

      // Send the payload as a JSON string through the WebSocket
      ws.current.send(JSON.stringify(payload));

      // Gelen mesajı messageHistory'e ekle
      const newMessage = {
        id: Date.now(),
        sender: currentUserName, // Mesaj gelen kişiyi seçtiğimiz kişi olarak ayarla
        message_text: enterMessage,
      };

      setMessageHistory((prevHistory) => [...prevHistory, newMessage]);
      setEnterMessage('');
    }
  };

  return (
    <div class="modal">
      <div class="modal__dialog">
        <div class="modal__close">
          <a href="#" class="modal__icon">
            <i class="fa fa-times" aria-hidden="true"></i>
          </a>
          <span class="modal__note">Çıkış Yap</span>
        </div>

        <div class="modal__content chat">
          <div class="modal__sidebar">
            <div class="chat__search search">
              <div class="search">
                <div class="search__icon">
                  <i class="fa fa-search" aria-hidden="true"></i>
                </div>
                <input type="search" class="search__input" placeholder="Kullanıcı Ara"></input >
                <div class="search__icon search__icon_right">
                  <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                </div>
              </div>
            </div>

            <div class="chat__users chat__users_fullheight ">
              <div class="users">
                {users.map((user) => (
                  <li class="users__item" key={user} onClick={() => setSelectedUser(user)} >
                    <div class="users__avatar avatar">
                      <a href="#" class="avatar__wrap">
                        {user[0]}
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
                      {selectedUser ? `${selectedUser[0]}` : '?'}
                    </a>
                  </div>
                  <div class="head__title">{selectedUser ? `${selectedUser}` : 'Kullanıcı Seçiniz'}</div>

                </div>
              </div>
              <div class="chatbox__row chatbox__row_fullheight">
                <div class="chatbox__content">
                  {messageHistory.map((message) => (
                    <div className="message" key={message.id}>
                      <div className="message__head">
                        <span className="message__note">{message.sender === currentUserName ? `${message.sent_at}` : `${message.sender}`}</span>
                        <span className="message__note">{message.sender === currentUserName ? `${message.sender}` : `${message.sent_at}`}</span>
                      </div>
                      <div className="message__base">

                        {message.sender === currentUserName ? (
                          <>
                            <div className="message__textbox">
                              <span className="message__text">{message.message_text}</span>
                            </div>
                            <div className="message__avatar avatar">
                              <a href="#" class="avatar__wrap">
                                <div class="avatar__img" width="35" height="35" >
                                  <a href="#" class="avatar__wrap" >
                                    {currentUserName[0]}
                                  </a>
                                </div>
                              </a>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="message__avatar avatar">
                              <a href="#" class="avatar__wrap">
                                <div class="avatar__img" width="35" height="35" >
                                  <a href="#" class="avatar__wrap" >
                                    {selectedUser[0]}
                                  </a>
                                </div>
                              </a>
                            </div>
                            <div className="message__textbox">
                              <span className="message__text">{message.message_text}</span>
                            </div>
                          </>
                        )}
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
