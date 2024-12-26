CREATE TABLE IF NOT EXISTS "messages"(
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    message Text NOT NULL,
    sent_at VARCHAR(240) NOT NULL
)