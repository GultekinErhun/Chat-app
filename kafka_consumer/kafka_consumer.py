from kafka import KafkaConsumer
import json
import logging
import db_operations
from config import settings

logger = logging.getLogger('message_processor')

def process_message_stream():
    message_consumer = KafkaConsumer(
        'message_events',
        bootstrap_servers=['kafka:9092'],
        auto_offset_reset='latest',
        group_id='message-processing-group',
        value_deserializer=lambda data: json.loads(data.decode('utf-8'))
    )

    db_conn = db_operations.create_db_connection(
        settings.POSTGRES_DB, 
        settings.POSTGRES_USER, 
        settings.POSTGRES_PASSWORD, 
        settings.POSTGRES_HOST, 
        settings.POSTGRES_PORT
    )

    if db_conn is None:
        logger.warning("Database connection failed")
        return None

    for msg_event in message_consumer:
        from_user = msg_event.value['sender']
        to_user = msg_event.value['receiver']

        sender_id = db_operations.get_user_id(db_conn, from_user)
        receiver_id = db_operations.get_user_id(db_conn, to_user)

        message = msg_event.value['message']
        sent_at = msg_event.value['sent_at']

        db_operations.store_message(
            db_conn, 
            sender_id, 
            receiver_id, 
            message, 
            sent_at
        )

if __name__ == "__main__":
    process_message_stream()