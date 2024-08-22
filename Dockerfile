# Etapa 1: Construção da aplicação
FROM node:18 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o package.json e o package-lock.json para o container
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação para o container
COPY . .

# Constrói a aplicação para produção
RUN npm run build

# Etapa 2: Servir a aplicação
FROM nginx:alpine

# Copia os arquivos estáticos da etapa de construção para o diretório padrão do nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expõe a porta que o Nginx usará


# Comando padrão para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
