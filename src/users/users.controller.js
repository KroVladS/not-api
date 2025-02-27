import { Router } from 'express' // Импортируем Router из библиотеки express
import { UsersService } from './users.service.js' // Импортируем TwitService из twit.service.js
import { authMiddleware } from '../auth.middelware.js' // Импортируем middleware для аутентификации
//import { createUserDto } from './users.dto.js'

const router = Router() // Создаем новый экземпляр маршрутизатора
const usersService = new UsersService() // Создаем новый экземпляр TwitService

// Обрабатываем POST-запрос на корневой маршрут
router.post('/', authMiddleware, async (req, res) => {
  // Проверяем, что текст присутствует в теле запроса
  //const validation = createUserDto.safeParse(req.body)
  // Если текст не соответствует схеме, возвращаем ошибку 400 // Возвращаем ошибку из зод
  //   if (!validation.success) {
  //     return res.status(400).json({
  //       message: validation.error.errors.map((error) => error.message).join(', '),
  //     })
  //   }

  const user = await usersService.createUser(req.body) // Создаем новый твит с помощью сервиса
  res.status(201).json(user) // Возвращаем созданный твит с кодом 201
})

router.get('/', authMiddleware, async (req, res) => {
  const users = await usersService.getUsers()
  res.status(200).json(users)
})

export const usersController = router // Экспортируем маршрутизатор как usersController
