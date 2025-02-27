import { createLogger, format, transports } from 'winston'

// Создаем логгер
const logger = createLogger({
  level: 'info', // Уровень логирования (например, 'info', 'error', 'debug')
  format: format.combine(
    format.timestamp(), // Добавляем временную метку
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`
    })
  ),
  transports: [
    // Логирование в консоль
    new transports.Console(),
    // Логирование в файл уровня 'error' и выше
    new transports.File({ filename: 'error.log', level: 'error' }),
    // Логирование в файл все логи
    new transports.File({ filename: 'combined.log' }),
  ],
})

export default logger
