# Многоэтапная сборка для React приложения

# Этап 1: Сборка приложения
FROM node:20-alpine as build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY family-tree-frontend/package.json family-tree-frontend/pnpm-lock.yaml ./

# Устанавливаем pnpm
RUN npm install -g pnpm

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходный код
COPY family-tree-frontend/ .

# Собираем приложение для продакшена
RUN pnpm run build

# Этап 2: Сервер для статических файлов
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Команда для запуска nginx
CMD ["nginx", "-g", "daemon off;"]

