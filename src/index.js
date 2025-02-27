import dotenv from 'dotenv' // Импортируем библиотеку dotenv для работы с переменными окружения
import express from 'express' // Импортируем библиотеку express для создания веб-сервера
import { usersController } from './users/users.controller.js' // Импортируем контроллер пользователей
import { PrismaClient } from '@prisma/client' // Импортируем PrismaClient для работы с базой данных
import logger from '../utils/loger.js'
import helmet from 'helmet'
import compression from 'compression'

dotenv.config() // Загружаем переменные окружения из .env файла

const app = express() // Создаем экземпляр приложения Express
const prisma = new PrismaClient() // Создаем экземпляр PrismaClient для работы с базой данных

async function main() {
  // Асинхронная функция main для инициализации сервера
  app.use(express.json()) // Настраиваем приложение для обработки JSON-данных
  app.use(helmet()) // Настраиваем приложение для обработки JSON-данных
  app.use(compression()) // Настраиваем приложение для сжатия данных

  app.use('/api/v1/users', usersController) // Подключаем контроллер пользователей к маршруту /api/v1/users

  app.use('/error', (req, res) => {
    // Обрабатываем GET-запросы на маршрут /error
    throw new Error('Это тестовая ошибка') // Генерируем тестовую ошибку
  })

  app.all('*', (req, res) => {
    // Обрабатываем все остальные маршруты
    logger.error(`Code error: 404; ${req.method} ${req.originalUrl}; `)
    res.status(404).json({
      // Возвращаем статус 404 и сообщение о том, что страница не найдена
      message: 'Страница не найдена',
    })
  })

  app.use((err, req, res, next) => {
    // Обрабатываем ошибки
    logger.error(err.stack) // Логируем стек ошибки в консоль
    res.status(500).json({
      // Возвращаем статус 500 и сообщение об ошибке
      message: 'Что-то пошло не так',
    })
  })

  app.listen(process.env.PORT, () => {
    // Запускаем сервер на порту, указанном в переменной окружения PORT
    logger.info(`Сервер запущен на порту ${process.env.PORT}`) // Логируем сообщение о запуске сервера
  })
}

main() // Вызываем функцию main для инициализации сервера
  .then(async () => {
    // После завершения работы сервера отключаемся от базы данных
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    // Если возникает ошибка, отключаемся от базы данных
    logger.error(e)
    await prisma.$disconnect()
    process.exit(1) // Завершаем работу приложения с кодом 1 (ошибка)
  })
