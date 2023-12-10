import psycopg2
from psycopg2 import sql

def postgres_connect(database, user, password, host, port):
    try:
        connection = psycopg2.connect(
            database=database,
            user=user,
            password=password,
            host=host,
            port=port
        )
        print("Bağlantı başarılı.")
        return connection
    except Exception as e:
        print(f"Hata: {e}")
        return None

def find_user_by_username(connection, username):
    cursor = connection.cursor()
    query = sql.SQL("SELECT * FROM users WHERE username = {}").format(sql.Literal(username))
    cursor.execute(query)
    user = cursor.fetchone()
    cursor.close()
    if user:
        return user
    else:
        return None
   

def create_user(connection, username, password):
    cursor = connection.cursor()
    query = sql.SQL("INSERT INTO users (username, password) VALUES ({}, {})").format(
        sql.Literal(username),
        sql.Literal(password)
    )
    cursor.execute(query)
    connection.commit()
    cursor.close()
    print("Kullanıcı oluşturuldu.")
 

def fetch_conversation_history(connection, user1_id, user2_id):
    cursor = connection.cursor()
    query= sql.SQL(f"""
    SELECT m.id, u.username as sender, u2.username as receiver, m.message, m.sent_at
    FROM messages m
    join users u on u.id = m.sender_id
    join users u2 on u2.id = m.receiver_id
    WHERE sender_id = {user1_id} and receiver_id = {user2_id} 
          or receiver_id = {user1_id} and sender_id = {user2_id} 
          ORDER BY sent_at ASC""")
    cursor.execute(query)
    history = cursor.fetchall()
    cursor.close()
    if history:
        return history
    else:
        return None

def get_userid_by_username(connection, username):
    cursor = connection.cursor()
    query = sql.SQL(f"SELECT id FROM users WHERE username = '{username}'")
    cursor.execute(query)
    userid = cursor.fetchone()
    cursor.close()
    return userid[0]

def fetch_users(connection):
    cursor = connection.cursor()
    query = sql.SQL("SELECT username FROM users")
    cursor.execute(query)
    users = cursor.fetchall()
    cursor.close()
    if users:
        return users
    else:
        return None