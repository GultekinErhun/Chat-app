from kafka import KafkaConsumer
import json

def kafka_consumer_job():
    consumer = KafkaConsumer(
        'sent_messages',
        bootstrap_servers=['kafka:9092'],
        auto_offset_reset='latest',
        group_id='streamlit-consumer-group',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )

    for message in consumer:
        print(message.value)

if __name__ == "__main__":
    kafka_consumer_job()