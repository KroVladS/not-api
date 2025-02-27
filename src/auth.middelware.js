export const authMiddleware = async (req, res, next) => {
  // Получаем токен из заголовков запроса
  const token = req.headers.authorization

  // Проверяем, есть ли токен
  if (!token) {
    // Если токен отсутствует, отправляем статус 401 (Неавторизован)
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // Если токен есть, продолжаем выполнение следующего middleware
  next()
}
