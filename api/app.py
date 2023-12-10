from werkzeug.security import generate_password_hash, check_password_hash

from db import *
from models import *
from authoritation import *
from fastapi import FastAPI, HTTPException, Depends, WebSocket
from typing import Dict
from fastapi.responses import HTMLResponse
import json

app = FastAPI()

db_connection = postgres_connect("chat", "postgres", "1q2w3e4rR", "localhost", "5432")

class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str ,WebSocket] = {}
        print(self.connections)

    async def connect(self, websocket: WebSocket, user_name:str):
        await websocket.accept()
        self.connections[user_name] = websocket
        print(self.connections)

    async def broadcast(self, data: str):
        for connection in self.connections.values():
            await connection.send_text(data)

    async def send_to_client(self, sender:str ,recipient:str, message:str):
        if recipient in self.connections:
            data = json.dumps({
                "sender":sender,
                "message":message
            })
            await self.connections[recipient].send_text(data)
       
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
      
        if "recipient" not in payload:
            await websocket.send_text("Missing 'recipient' field in JSON.")
            continue
        if "message" not in payload:
            await websocket.send_text("Missing 'message' field in JSON.")
            continue
        await manager.send_to_client(user_name,payload["recipient"] , payload["message"])


if __name__ == "__main__":
    import uvicorn

    # "app" değişkeni, FastAPI uygulamanızın adını yansıtmalıdır
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

