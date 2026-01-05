FROM node:20-alpine
WORKDIR /app

# Puisque le context est déjà ./jadevine-webapp/frontend,
# on cherche les fichiers à la racine du context (.)
COPY package*.json ./
RUN npm install

# On copie tout le contenu du dossier actuel (.) vers WORKDIR (/app)
COPY . .

EXPOSE 3000
ENV CI=true
ENV WDS_SOCKET_PORT=0
CMD ["npm", "start"]