FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite default port (5173) or CRA port (3000)
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]