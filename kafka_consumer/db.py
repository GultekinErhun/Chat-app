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

def find_userid_by_username(connection, username):
    cursor = connection.cursor()
    query = sql.SQL(f"SELECT id FROM users WHERE username = '{username}'")
    cursor.execute(query)
    userid = cursor.fetchone()
    cursor.close()
    return userid[0]

def insert_message(connection, sender_id, receiver_id, message, sent_at = ""):
    try:
        cursor = connection.cursor()
        if sent_at == "":
            query = sql.SQL("INSERT INTO messages (sender_id, receiver_id, message) VALUES ({}, {}, {})").format( sql.Literal(sender_id), sql.Literal(receiver_id), sql.Literal(message))
        else:
            query = sql.SQL("INSERT INTO messages (sender_id, receiver_id, message, sent_at) VALUES ({}, {}, {}, {})").format( sql.Literal(sender_id), sql.Literal(receiver_id), sql.Literal(message), sql.Literal(sent_at))
        
        cursor.execute(query)
        connection.commit()
    except psycopg2.Error as e:

        print(f"Error during message insertion: {e}")
        cursor.rollback()
    finally:
        cursor.close()