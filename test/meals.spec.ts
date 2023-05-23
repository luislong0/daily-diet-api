import { afterAll, beforeAll, expect, describe, it, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Meals Routes', () => {
  beforeAll(async () => {
    await app.ready()
  }, 1000)

  afterAll(async () => {
    await app.close()
  }, 1000)

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a meal', async () => {
    await request(app.server).post('/user').send({
      name: 'Teste Vitest 2',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    const userData = listUsersResponse.body[0]

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste',
        description: 'Refeição teste vitest',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)
  })

  it('should be able to list user meals', async () => {
    await request(app.server).post('/user').send({
      name: 'Teste Vitest 2',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    const userData = listUsersResponse.body[0]

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste',
        description: 'Refeição teste vitest',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get(`/meal?userId=${userData.id}`)
      .expect(200)

    expect(listMealsResponse.body).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          isInDiet: expect.any(Number),
          user_id: expect.any(String),
          userName: expect.any(String),
          bio: expect.any(String),
          photoUrl: expect.any(String),
          created_at: expect.any(String),
        },
      ]),
    )
  })

  it('should be able to list user unique meal', async () => {
    await request(app.server).post('/user').send({
      name: 'Teste Vitest 2',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    const userData = listUsersResponse.body[0]

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste',
        description: 'Refeição teste vitest',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get(`/meal?userId=${userData.id}`)
      .expect(200)

    const listMealResponse = await request(app.server)
      .get(`/meal?id=${listMealsResponse.body[0].id}`)
      .expect(200)

    expect(listMealResponse.body).toEqual(
      expect.arrayContaining([
        {
          id: listMealsResponse.body[0].id,
          name: listMealsResponse.body[0].name,
          description: listMealsResponse.body[0].description,
          isInDiet: listMealsResponse.body[0].isInDiet,
          user_id: listMealsResponse.body[0].user_id,
          userName: listMealsResponse.body[0].userName,
          bio: listMealsResponse.body[0].bio,
          photoUrl: listMealsResponse.body[0].photoUrl,
          created_at: listMealsResponse.body[0].created_at,
        },
      ]),
    )
  })

  it('should be able to changes a meal information', async () => {
    await request(app.server).post('/user').send({
      name: 'Teste Vitest 3',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    const userData = listUsersResponse.body[0]

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get(`/meal?userId=${userData.id}`)
      .expect(200)

    const fullDate = listMealsResponse.body[0].created_at
    const [date, time] = fullDate.split(' ')
    const dataParts = date.split('-')
    const newDate = dataParts[2] + '/' + dataParts[1] + '/' + dataParts[0]

    let isInDietBoolean = false

    if (listMealsResponse.body[0].isInDiet === 0) {
      isInDietBoolean = false
    } else if (listMealsResponse.body[0].isInDiet === 1) {
      isInDietBoolean = true
    }

    await request(app.server)
      .put('/meal')
      .send({
        id: listMealsResponse.body[0].id,
        name: 'Teste Meal rota Put',
        description: listMealsResponse.body[0].description,
        isInDiet: isInDietBoolean,
        date: String(newDate),
        time: String(time),
      })
      .expect(200)
  })

  it('should be able to delete a meal ', async () => {
    await request(app.server).post('/user').send({
      name: 'Teste Vitest 3',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    const userData = listUsersResponse.body[0]

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get(`/meal?userId=${userData.id}`)
      .expect(200)

    const mealId = listMealsResponse.body[0].id

    await request(app.server).delete(`/meal?id=${mealId}`).expect(200)
  })

  it('should be able to get a user meals information ', async () => {
    await request(app.server).post('/user').send({
      name: 'Teste Vitest 3',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    const userData = listUsersResponse.body[0]

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Refeição teste 2',
        description: 'Refeição teste vitest 2',
        isInDiet: true,
        userId: userData.id,
      })
      .expect(201)

    const listUserMealsInformationResponse = await request(app.server)
      .get(`/meal/info?id=${userData.id}`)
      .expect(200)

    expect(listUserMealsInformationResponse.body).toEqual(
      expect.objectContaining({
        mealsCount: expect.any(Number),
        inDietCount: expect.any(Number),
        notInDietCount: expect.any(Number),
        bestSequence: expect.any(Number),
      }),
    )
  })
})
