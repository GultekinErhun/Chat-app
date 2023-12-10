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
 

