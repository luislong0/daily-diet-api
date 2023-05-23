import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import crypto from 'node:crypto'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
  app.get('/users', async (request, reply) => {
    const users = await knex('users').select('*')
    return users
  })

  app.get('/user', async (request, reply) => {
    const searchUserSchema = z.object({
      id: z.string(),
    })

    const { id } = searchUserSchema.parse(request.query)

    const users = await knex('users').select('*').where('id', id)

    if (users.length === 0) {
      reply.status(401).send({ message: 'User not found!' })
    }

    return users
  })

  app.post('/user', async (request, reply) => {
    const searchUserSchema = z.object({
      name: z.string(),
      bio: z.string(),
      photoUrl: z.string(),
    })

    const { name, bio, photoUrl } = searchUserSchema.parse(request.body)

    const users = await knex('users').select('*').where('name', name)

    if (users.length !== 0) {
      reply.status(401).send({ message: 'User already exists!' })
    }

    const user = await knex('users')
      .insert({
        id: crypto.randomUUID(),
        name,
        bio,
        photoUrl,
      })
      .returning('*')

    reply.status(201).send(user)
  })
}
