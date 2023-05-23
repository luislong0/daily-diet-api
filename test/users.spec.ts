import { afterAll, beforeAll, expect, describe, it, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('User Routes', () => {
  beforeAll(async () => {
    await app.ready()
    // execSync('npm run knex migrate:latest')
  })

  afterAll(async () => {
    await app.close()
    // execSync('npm run knex migrate:rollback --all')
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a user', async () => {
    await request(app.server)
      .post('/user')
      .send({
        name: 'Teste Vitest 2',
        bio: 'TesteVitest',
        photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
      })
      .expect(201)
  })

  it("shouldn't be able to create a user", async () => {
    await request(app.server)
      .post('/user')
      .send({
        name: 'Teste Vitest 2',
        bio: 'TesteVitest',
        photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
      })
      .expect(201)

    await request(app.server)
      .post('/user')
      .send({
        name: 'Teste Vitest 2',
        bio: 'TesteVitest',
        photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
      })
      .expect(401)
  })

  it('should be able to list all users', async () => {
    await request(app.server).post('/user').send({
      name: 'Teste Vitest 2',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    expect(listUsersResponse.body).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          name: expect.any(String),
          bio: expect.any(String),
          photoUrl: expect.any(String),
          created_at: expect.any(String),
        },
      ]),
    )
  })

  it('should be able to list unique user', async () => {
    await request(app.server).post('/user').send({
      name: 'Teste Vitest 2',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    await request(app.server).post('/user').send({
      name: 'Teste Vitest 2',
      bio: 'TesteVitest',
      photoUrl: 'https://avatars.githubusercontent.com/u/100600769?v=4',
    })

    const listUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    const userData = listUsersResponse.body[0]

    const listUserResponse = await request(app.server)
      .get(`/user?id=${userData.id}`)
      .expect(200)

    expect(listUserResponse.body[0]).toEqual({
      id: userData.id,
      name: userData.name,
      bio: userData.bio,
      photoUrl: userData.photoUrl,
      created_at: userData.created_at,
    })
  })
})
