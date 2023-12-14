from kafka import KafkaConsumer
import json
import logging
import db
from config import settings

logger = logging.getLogger('tcpserver')

def kafka_consumer_job():
    consumer = KafkaConsumer(
        'sent_messages',
        bootstrap_servers=['kafka:9092'],
        auto_offset_reset='latest',
        group_id='streamlit-consumer-group',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )

    db_connection = db.postgres_connect(settings.POSTGRES_DB, settings.POSTGRES_USER, settings.POSTGRES_PASSWORD, settings.POSTGRES_HOST, settings.POSTGRES_PORT)
    if db_connection == None:
        logger.warning("can not connect to db")
        return None
    for message in consumer:
        sender = message.value['sender']
        receiver = message.value['receiver']
        sender_id = db.find_userid_by_username(db_connection, sender)
        receiver_id = db.find_userid_by_username(db_connection, receiver)
        message_text = message.value['message']
        sent_at = message.value['sent_at']
        db.insert_message(db_connection, sender_id, receiver_id, message_text, sent_at)


        

if __name__ == "__main__":
    kafka_consumer_job()



