FROM node:22-alpine

WORKDIR /app

# Instaliuojam deps
COPY package*.json ./
RUN npm install

# Prisma failai (kad galėtų migrate/generate)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Src (bet dev režime vis tiek mountinsim)
COPY src ./src

EXPOSE 4000

CMD ["npm", "run", "dev"]
