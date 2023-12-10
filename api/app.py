from werkzeug.security import generate_password_hash, check_password_hash

from db import *
from models import *
from config import settings
from authoritation import *
from fastapi import FastAPI, HTTPException, Depends, WebSocket
from typing import Dict
from kafka import KafkaProducer
import json
import logging

logger = logging.getLogger('tcpserver')
app = FastAPI()

db_connection = postgres_connect(settings.POSTGRES_DB, settings.POSTGRES_USER, settings.POSTGRES_PASSWORD, settings.POSTGRES_HOST, settings.POSTGRES_PORT)

producer = KafkaProducer(
    bootstrap_servers=['kafka:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str ,WebSocket] = {}
        print(self.connections)

    def user_is_in(self, user_name):
        return user_name in self.connections
    
    async def connect(self, websocket: WebSocket, user_name:str):
        await websocket.accept()
        self.connections[user_name] = websocket
        print(self.connections)

    async def broadcast(self, data: str):
        for connection in self.connections.values():
            await connection.send_text(data)

    async def send_to_client(self, sender:str ,receiver:str, message:str):
        if receiver in self.connections:
            data = json.dumps({
                "sender":sender,
                "message":message
            })
            await self.connections[receiver].send_text(data)
       
manager = ConnectionManager()


@app.post("/signup")
def signup(user: SignupRequet):
    try:
        existing_user = find_user_by_username(db_connection, user.username)
    except Exception as e:
        raise HTTPException(status_code=500,detail=e)

    if existing_user:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanılıyor.")

    hashed_password = generate_password_hash(user.password, method='pbkdf2:sha256')

    try:
        create_user(db_connection, user.username, hashed_password)
    except Exception as e:
        raise HTTPException(status_code=500,detail=e)
    

    return {"message": "Kullanıcı başarıyla kaydedildi."}


@app.post("/login")
def signup(request: LoginRequet):
    try:
        user = find_user_by_username(db_connection, request.username)
    except Exception as e:
        raise HTTPException(status_code=500,detail=e)
    print(user)
    if user and check_password_hash(user[2], request.password):
        
        access_token = create_access_token(
            data={"sub": request.username}
        )
        print(access_token)
        active_sessions.add(access_token)
        return {"user_name": user[1], "access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401,detail="Invalid username or password")
    
@app.post("/logout")
def logout(token: str = Depends(oauth2_scheme)):
    if token in active_sessions:
        active_sessions.remove(token)
        return {"message": "Logout successful"}
    else:
        raise HTTPException(status_code=401,detail="Not logged in")

@app.get("/protected-endpoint")
def protected_endpoint(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello, {current_user}! This is a protected endpoint."}

   
@app.websocket("/chat/{user_name}")
async def websocket_endpoint(websocket: WebSocket, user_name: str):
    await manager.connect(websocket, user_name)
    while True:
        payload = await websocket.receive_json()
      
        if "receiver" not in payload:
            await websocket.send_text("Missing 'receiver' field in JSON.")
            continue
        if "message" not in payload:
            await websocket.send_text("Missing 'message' field in JSON.")
            continue
        
        message = payload["message"]
        receiver = payload["receiver"]

        if manager.user_is_in(receiver):
            kafka_data = {
                "sender": user_name,
                "receiver": receiver, 
                "message": message,
            }
            producer.send('sent_messages', value=kafka_data)

        await manager.send_to_client(user_name, receiver, message)

@app.get("/chat/{username}/history")
def chat_history(username: str, current_user: str = Depends(get_current_user)):
    user1_id = get_userid_by_username(db_connection, username)
    user2_id = get_userid_by_username(db_connection, current_user)
    history = fetch_conversation_history(db_connection, user1_id, user2_id)
    logger.warning(history)
    if history==None:
        return {'history':history}
    chatHistory = []
    for message in history:
        m = {}
        m['id'] = message[0]
        m['sender'] = message[1]
        m['receiver'] = message[2]
        m['message_text'] = message[3]
        m['sent_at'] = message[4]
        chatHistory.append(m)
    return {'history':chatHistory}
# rec, sen, time

# yeni endpoint: butun user return
@app.get("/users")
def get_users():
    users =  fetch_users(db_connection)
    if users== None:
        return None
    logger.warning(users)
    user_list = []
    for u in users:
        user_list.append(u[0])
    return {'users' : user_list}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=settings.API_HOST, port=8000, reload=True)

