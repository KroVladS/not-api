import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class UsersService {
  // Метод для создания пользователя
  async createUser(userData) {
    // Подготавливаем данные для создания пользователя
    const { address, company, ...userInfo } = userData

    // Создаем объект с данными пользователя
    const data = { ...userInfo }

    // Если переданы данные адреса, добавляем их
    if (address) {
      const { geo, ...addressInfo } = address
      data.address = {
        create: {
          ...addressInfo,
          // Если переданы геоданные, создаем их
          ...(geo && {
            geo: {
              create: geo,
            },
          }),
        },
      }
    }

    // Если переданы данные компании, добавляем их
    if (company) {
      data.company = {
        create: company,
      }
    }

    // Создаем нового пользователя в базе данных со всеми связями
    return await prisma.user.create({
      data,
      include: {
        address: {
          include: {
            geo: true,
          },
        },
        company: true,
      },
    })
  }

  // Метод для получения всех пользователей
  async getUsers() {
    // Получаем всех пользователей из базы данных с их связями
    return await prisma.user.findMany({
      include: {
        address: {
          include: {
            geo: true,
          },
        },
        company: true,
      },
    })
  }

  // Метод для получения пользователя по ID
  async getUserById(id) {
    // Преобразуем id в число, если он передан как строка
    const userId = typeof id === 'string' ? parseInt(id, 10) : id

    // Получаем пользователя по ID из базы данных со всеми связями
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: {
          include: {
            geo: true,
          },
        },
        company: true,
      },
    })
  }

  // Метод для обновления пользователя
  async updateUser(id, userData) {
    // Преобразуем id в число, если он передан как строка
    const userId = typeof id === 'string' ? parseInt(id, 10) : id

    // Подготавливаем данные для обновления пользователя
    const { address, company, ...userInfo } = userData

    // Создаем объект с данными пользователя
    const data = { ...userInfo }

    // Если переданы данные адреса, обновляем их
    if (address) {
      // Получаем текущего пользователя для проверки наличия адреса
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { address: true },
      })

      const { geo, ...addressInfo } = address

      if (currentUser?.addressId) {
        // Если у пользователя уже есть адрес, обновляем его
        data.address = {
          update: {
            ...addressInfo,
            // Если переданы геоданные, обновляем их
            ...(geo && {
              geo: currentUser.address?.geoId
                ? { update: geo }
                : { create: geo },
            }),
          },
        }
      } else {
        // Если у пользователя нет адреса, создаем новый
        data.address = {
          create: {
            ...addressInfo,
            // Если переданы геоданные, создаем их
            ...(geo && {
              geo: {
                create: geo,
              },
            }),
          },
        }
      }
    }

    // Если переданы данные компании, обновляем их
    if (company) {
      // Получаем текущего пользователя для проверки наличия компании
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      })

      if (currentUser?.companyId) {
        // Если у пользователя уже есть компания, обновляем ее
        data.company = {
          update: company,
        }
      } else {
        // Если у пользователя нет компании, создаем новую
        data.company = {
          create: company,
        }
      }
    }

    // Обновляем пользователя в базе данных
    return await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        address: {
          include: {
            geo: true,
          },
        },
        company: true,
      },
    })
  }

  // Метод для удаления пользователя
  async deleteUser(id) {
    // Преобразуем id в число, если он передан как строка
    const userId = typeof id === 'string' ? parseInt(id, 10) : id

    // Получаем пользователя для определения связанных данных
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: {
          include: {
            geo: true,
          },
        },
        company: true,
      },
    })

    // Если пользователь не найден, возвращаем null
    if (!user) return null

    // Начинаем транзакцию для удаления пользователя и связанных данных
    return await prisma.$transaction(async (tx) => {
      // Если у пользователя есть адрес и гео, удаляем их
      if (user.address?.geo) {
        await tx.geo.delete({
          where: { id: user.address.geo.id },
        })
      }

      // Если у пользователя есть адрес, удаляем его
      if (user.address) {
        await tx.address.delete({
          where: { id: user.address.id },
        })
      }

      // Если у пользователя есть компания, удаляем ее
      if (user.company) {
        await tx.company.delete({
          where: { id: user.company.id },
        })
      }

      // Удаляем пользователя
      return await tx.user.delete({
        where: { id: userId },
      })
    })
  }

  // Метод для поиска пользователей по имени или email
  async searchUsers(searchTerm) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { username: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        address: {
          include: {
            geo: true,
          },
        },
        company: true,
      },
    })
  }
}
