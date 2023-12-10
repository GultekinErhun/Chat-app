CREATE TABLE IF NOT EXISTS "messages"(
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    message VARCHAR(240) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)