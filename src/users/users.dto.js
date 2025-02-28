// src/users/users.dto.js
import { z } from 'zod'

// Схема валидации для геоданных
const geoSchema = z.object({
  lat: z.string().optional(),
  lng: z.string().optional(),
})

// Схема валидации для адреса
const addressSchema = z.object({
  street: z.string().optional(),
  suite: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
  geo: geoSchema.optional(),
})

// Схема валидации для компании
const companySchema = z.object({
  name: z.string().optional(),
  catchPhrase: z.string().optional(),
  bs: z.string().optional(),
})

// Схема валидации для создания пользователя
export const createUserDto = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  username: z.string().min(1, 'Имя пользователя обязательно'),
  email: z.string().email('Неверный формат email').nonempty('Email обязателен'),
  phone: z.string().min(1, 'Телефон обязателен'),
  website: z.string().min(1, 'Веб-сайт обязателен'),
  address: addressSchema.optional(),
  company: companySchema.optional(),
})

// Схема валидации для обновления пользователя
export const updateUserDto = z.object({
  name: z
    .string()
    .min(1, 'Имя должно содержать хотя бы один символ')
    .optional(),
  username: z
    .string()
    .min(1, 'Имя пользователя должно содержать хотя бы один символ')
    .optional(),
  email: z.string().email('Неверный формат email').optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: addressSchema.optional(),
  company: companySchema.optional(),
})
