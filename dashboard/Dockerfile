# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Set the working directory in the container
WORKDIR /app

COPY . .

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     curl \
#     software-properties-common \
#     git \
#     && rm -rf /var/lib/apt/lists/*
   
RUN pip install streamlit
# RUN pip install --no-cache-dir -r requirements.txt

# Make port 3000 available to the world outside this container
EXPOSE 8501

# Run app.py when the container launches
CMD streamlit run app.py --server.port 8501
