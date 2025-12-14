# Используем официальный Python образ
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY family-tree-api/requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код приложения
COPY family-tree-api/src ./src

# Создаем директорию для базы данных
RUN mkdir -p /app/data

# Устанавливаем переменные окружения
ENV FLASK_APP=src/main.py
ENV FLASK_ENV=production
ENV DATABASE_URL=sqlite:///data/family_tree.db

# Открываем порт
EXPOSE 5001

# Команда для запуска приложения
CMD ["python", "src/main.py"]

