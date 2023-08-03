const { app, db } = require('../server')
const request = require('supertest')


const protectedEndpoint = '/user/update'
describe('Protected endpoints deny access to not logged user', () => {
    let server = {}
    beforeAll(async() => {server = await app.init()})
    afterAll(async() => {await server.close()})

    test('Protected endpoint cannot be accessed by user not logged', async() => {
        const response = await request(app)
            .post(protectedEndpoint)
            .expect(401)
    })

    // test('Deny access after user loggout', async() => {
    //     ???
    // })
})

describe('Protected endpoints give access to logged user', () => {
    let server = {}
    let user = {}
    beforeAll(async() => {
        server = await app.init()
        user = await db.createUser('user.email@email.com', 'aaaa!1')
    })

    afterAll(async() => {
        await user.delete()
        await server.close()
    })

    test('Logged user can access protected endpoints', async() => {
        const responseLogin = await request(app)
            .post('/auth/login')
            .send({
                'email':'user.email@email.com',
                'password': 'aaaa!1'
            })
            .expect(200)

        const accessToken = responseLogin.body.accessToken
        const response = await request(app)
            .put(protectedEndpoint)
            .set('authorization', accessToken)
            .send({'name':'Valid name'})
            .expect(200)
    })
})