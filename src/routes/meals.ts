import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import crypto from 'node:crypto'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/meal', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache')

    const searchUserSchema = z.object({
      id: z.string().optional(),
      userId: z.string().optional(),
    })

    const { id, userId } = searchUserSchema.parse(request.query)

    if (!id) {
      const user = await knex('users').select('*').where('id', userId)

      if (user.length === 0) {
        return reply.status(401).send({ message: 'User not found!' })
      }

      const meals = await knex
        .select(
          'meals.*',
          'users.name as userName',
          'users.bio',
          'users.photoUrl',
        )
        .where('user_id', userId)
        .from('meals')
        .join('users', 'meals.user_id', '=', 'users.id')
        .orderBy('created_at')

      reply.send(meals)
    } else {
      const meal = await knex('meals').select('*').where('id', id)

      if (meal.length === 0) {
        return reply.status(401).send({ message: 'Meal not found!' })
      }

      const meals = await knex('meals')
        .join('users', 'meals.user_id', '=', 'users.id')
        .where('meals.id', id)
        .select(
          'meals.*',
          'users.name as userName',
          'users.bio',
          'users.photoUrl',
        )

      reply.send(meals)
    }
  })

  app.get('/meal/info', async (request, reply) => {
    const searchUserSchema = z.object({
      id: z.string().optional(),
    })

    const { id } = searchUserSchema.parse(request.query)

    const user = await knex('users').select('*').where('id', id)

    if (user.length === 0) {
      return reply.status(401).send({ message: 'User not found!' })
    }

    const mealsCount = await knex('meals')
      .count({ count: 'id' })
      .where('user_id', id)
      .first()

    const inDietCount = await knex('meals')
      .count({ count: 'isInDiet' })
      .where('isInDiet', 1)
      .andWhere('user_id', id)
      .first()

    const notInDietCount = await knex('meals')
      .count({ count: 'isInDiet' })
      .where('isInDiet', 0)
      .andWhere('user_id', id)
      .first()

    async function getBestSequenceCount() {
      const meals = await knex('meals')
        .select('*')
        .where('user_id', id)
        .orderBy('created_at')

      let exampleCount = 0
      const mealsCount = []

      for (let i = 0; i < meals.length; i++) {
        if (meals[i].isInDiet === 1) {
          exampleCount++
          if (i === meals.length - 1) {
            mealsCount.push(exampleCount)
          }
        } else if (meals[i].isInDiet === 0) {
          mealsCount.push(exampleCount)
          exampleCount = 0
        }
      }

      return mealsCount.filter((count) => count > 0)
    }

    const bestSequenceArray = await getBestSequenceCount()

    const bestSequence = Math.max(...bestSequenceArray)

    const mealsInformation = {
      mealsCount: mealsCount?.count,
      inDietCount: inDietCount?.count,
      notInDietCount: notInDietCount?.count,
      bestSequence,
    }

    reply.send(mealsInformation)
  })

  app.post('/meal', async (request, reply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      isInDiet: z.boolean(),
      userId: z.string(),
    })

    const { name, description, isInDiet, userId } = createMealSchema.parse(
      request.body,
    )

    await knex('meals')
      .insert({
        id: crypto.randomUUID(),
        name,
        description,
        isInDiet,
        user_id: userId,
      })
      .returning('*')

    reply.status(201).send({ message: 'Meal created successfully!' })
  })

  app.put('/meal', async (request, reply) => {
    const createMealSchema = z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      isInDiet: z.boolean(),
      date: z.string(),
      time: z.string(),
    })

    const { id, name, description, isInDiet, date, time } =
      createMealSchema.parse(request.body)

    const dateTimeString = `${date.split('/').reverse().join('-')} ${time}:00`

    const meal = await knex('meals').select('*').where('id', id)

    if (meal.length === 0) {
      return reply.status(401).send({ message: 'Meal not found!' })
    }

    await knex('meals')
      .where('meals.id', id)
      .update({
        name,
        description,
        isInDiet,
        created_at: dateTimeString,
      })
      .returning(['name', 'description', 'isInDiet', 'created_at'])

    reply.status(200).send({ message: 'Data changed successfully!' })
  })

  app.delete('/meal', async (request, reply) => {
    const searchUserSchema = z.object({
      id: z.string().optional(),
    })

    const { id } = searchUserSchema.parse(request.query)

    const meal = await knex('meals').select('*').where('id', id)

    if (meal.length === 0) {
      return reply.status(401).send({ message: 'Meal not found!' })
    }

    await knex('meals').where('meals.id', id).del()

    reply.status(200).send({ message: 'Meal deleted successfully!' })
  })
}
