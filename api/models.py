from pydantic import BaseModel


class SignupRequet(BaseModel):
    username: str
    password: str

class LoginRequet(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

