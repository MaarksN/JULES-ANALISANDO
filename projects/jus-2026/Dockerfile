FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de configuração do Workspace
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Instalar dependências (Apenas produção para o backend)
RUN npm install --workspaces --production

# Copiar código fonte do Backend
COPY apps/api ./apps/api

# Variáveis de Ambiente (Injeção em tempo de execução recomendada)
ENV NODE_ENV=production
ENV PORT=3001

# Definir diretório de trabalho para o backend
WORKDIR /app/apps/api

# Comando de início
CMD ["node", "server.js"]
