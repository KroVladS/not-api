import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class UsersService {
  // Метод для создания пользователя
  async createUser(user) {
    // Создаем новый пользователь в базе данных
    return await prisma.user.create({
      data: user,
    })
  }

  // Метод для получения всех пользователей
  async getUsers() {
    // Получаем все пользователей из базы данных
    return await prisma.user.findMany()
  }
}
