# 1. Use a lightweight version of Node.js
FROM node:18-alpine

# 2. Create a working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of your frontend code
COPY . .

# 5. Expose the port your React app runs on (usually 3000 or 5173)
EXPOSE 3000

# 6. Start the app (change to "npm run dev" if you are using Vite)
CMD ["npm","run" ,"start"]