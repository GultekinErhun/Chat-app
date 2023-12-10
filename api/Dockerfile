FROM python:3.8-slim

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENV POSTGRES_HOST=postgres
ENV POSTGRES_PORT=5432
ENV POSTGRES_DB=chat-app
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin

CMD uvicorn app:app --reload

