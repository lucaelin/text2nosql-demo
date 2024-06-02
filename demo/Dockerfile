#FROM vllm/vllm-openai:latest
FROM node:21

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Serve the app
CMD ["npm", "start"]