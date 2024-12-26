import psycopg2
from psycopg2 import sql

def create_db_connection(db_name, db_user, db_pass, db_host, db_port):
    try:
        conn = psycopg2.connect(
            database=db_name,
            user=db_user,
            password=db_pass,
            host=db_host,
            port=db_port
        )
        print("Database connection established successfully.")
        return conn
    except Exception as error:
        print(f"Connection error occurred: {error}")
        return None

def get_user_id(conn, user_name):
    cur = conn.cursor()
    select_query = sql.SQL(f"SELECT id FROM users WHERE user_name = '{user_name}'")
    cur.execute(select_query)
    result = cur.fetchone()
    cur.close()
    return result[0]

def store_message(conn, sender_id, receiver_id, message, sent_at = ""):
    try:
        cur = conn.cursor()
        if sent_at == "":
            insert_query = sql.SQL("""
                INSERT INTO message_logs 
                (sender_id, receiver_id, message) 
                VALUES ({}, {}, {})
            """).format(
                sql.Literal(sender_id), 
                sql.Literal(receiver_id), 
                sql.Literal(message)
            )
        else:
            insert_query = sql.SQL("""
                INSERT INTO message_logs 
                (sender_id, receiver_id, message, sent_at) 
                VALUES ({}, {}, {}, {})
            """).format(
                sql.Literal(sender_id), 
                sql.Literal(receiver_id), 
                sql.Literal(message), 
                sql.Literal(sent_at)
            )

        cur.execute(insert_query)
        conn.commit()
    except psycopg2.Error as error:
        print(f"Message storage failed: {error}")
        cur.rollback()
    finally:
        cur.close()