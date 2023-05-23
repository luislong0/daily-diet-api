import fastify from 'fastify'
import { mealsRoutes } from './routes/meals'
import { userRoutes } from './routes/users'

export const app = fastify()

// GET, POST, PUT, PATCH, DELETE

app.register(mealsRoutes)
app.register(userRoutes)
