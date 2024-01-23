# Build stage
FROM node:20.11.0 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Run stage
FROM node:20.11.0
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .
EXPOSE 3001
CMD ["npm", "run", "dev"]
