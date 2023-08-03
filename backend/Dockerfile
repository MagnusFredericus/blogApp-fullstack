FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 5432
CMD npm start