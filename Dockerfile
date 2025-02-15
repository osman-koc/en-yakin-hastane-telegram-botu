FROM node:18.17.1

ENV OPENSTREETMAP_URI="https://nominatim.openstreetmap.org/reverse"
ENV GOOGLE_MAPS_URI="https://www.google.com/maps/search/?api=1"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
