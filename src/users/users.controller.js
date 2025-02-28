import { Router } from 'express' // Импортируем Router из библиотеки express
import { UsersService } from './users.service.js' // Импортируем TwitService из twit.service.js
import { authMiddleware } from '../auth.middelware.js' // Импортируем middleware для аутентификации
import { createUserDto, updateUserDto } from './users.dto.js' // Импортируем схемы валидации
//import { createUserDto } from './users.dto.js'

const router = Router() // Создаем новый экземпляр маршрутизатора
const usersService = new UsersService() // Создаем новый экземпляр TwitService

// Обрабатываем POST-запрос для создания нового пользователя
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Валидация входящих данных
    const validatedData = createUserDto.parse(req.body)
    const user = await usersService.createUser(validatedData)
    res.status(201).json(user)
  } catch (error) {
    // Проверяем, является ли ошибка ошибкой валидации Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: error.issues.map((issue) => issue.message).join(', '),
      })
    }
    // Для других типов ошибок
    res.status(400).json({ message: error.message })
  }
})

// Обрабатываем POST-запрос для массового создания пользователей
router.post('/bulk', authMiddleware, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Ожидается массив пользователей' })
    }

    const createdUsers = []
    for (const userData of req.body) {
      try {
        const user = await usersService.createUser(userData)
        createdUsers.push(user)
      } catch (error) {
        createdUsers.push({ error: error.message, data: userData })
      }
    }

    res.status(201).json(createdUsers)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Обрабатываем GET-запрос для получения всех пользователей
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Если есть параметр поиска, используем метод поиска
    if (req.query.search) {
      const users = await usersService.searchUsers(req.query.search)
      return res.status(200).json(users)
    }

    // Иначе получаем всех пользователей
    const users = await usersService.getUsers()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Обрабатываем GET-запрос для получения пользователя по имени пользователя
router.get('/username/:username', authMiddleware, async (req, res) => {
  try {
    const users = await usersService.searchUsers(req.params.username)

    // Находим пользователя с точным совпадением имени пользователя
    const user = users.find((u) => u.username === req.params.username)

    // Если пользователь не найден, возвращаем ошибку 404
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Обрабатываем GET-запрос для получения пользователя по ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id)

    // Если пользователь не найден, возвращаем ошибку 404
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Обрабатываем PUT-запрос для обновления пользователя
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Валидация входящих данных
    const validatedData = updateUserDto.parse(req.body)
    const user = await usersService.updateUser(req.params.id, validatedData)

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.status(200).json(user)
  } catch (error) {
    // Проверяем, является ли ошибка ошибкой валидации Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: error.issues.map((issue) => issue.message).join(', '),
      })
    }
    // Для других типов ошибок
    res.status(400).json({ message: error.message })
  }
})

// Обрабатываем PATCH-запрос для частичного обновления пользователя
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await usersService.updateUser(req.params.id, req.body)

    // Если пользователь не найден, возвращаем ошибку 404
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Обрабатываем DELETE-запрос для удаления пользователя
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await usersService.deleteUser(req.params.id)

    // Если пользователь не найден, возвращаем ошибку 404
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.status(200).json({ message: 'Пользователь успешно удален' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export const usersController = router // Экспортируем маршрутизатор как usersController
