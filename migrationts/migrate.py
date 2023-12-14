import psycopg2
from psycopg2 import sql
import os

POSTGRES_HOST='localhost'
POSTGRES_PORT=5433
POSTGRES_DB='chat-app'
POSTGRES_USER='admin'
POSTGRES_PASSWORD='admin'
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


def execute_transaction(connection, script_path):
    try:
        with connection.cursor() as cursor:
            # Read SQL script from file
            with open(script_path, 'r') as sql_file:
                sql_script = sql_file.read()

            # Execute the SQL script
            cursor.execute(sql_script)

        # Commit the transaction
        connection.commit()
        print("Transaction executed successfully.")
    except Exception as e:
        # Rollback in case of an error
        connection.rollback()
        print(f"Transaction failed: {e}")

if __name__ == "__main__":
    # Establish a connection
    connection = postgres_connect(POSTGRES_DB,POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT)
    
    if connection:
        print('connection established')
        # Replace 'your_script.sql' with the actual name of your SQL script
        script_paths = ['001_api.up.sql',
                        '002_api.up.sql'
                        ]
        dir = os.getcwd() + '/migrationts'
        
        # Execute the transaction
        for path in script_paths:
            execute_transaction(connection, dir + '/' + path)

        # Close the connection
        connection.close()
