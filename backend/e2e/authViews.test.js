const { app, db } = require('../server')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const REFRESH_TOKEN_EXPIRES_IN = '1d'

//NEED TO IMPROVE: Login successful - user got accessToken
//NEED TO IMPROVE: Refresh token cleaned on brownser

describe('Register endpoint', () => {
    let server = {}

    beforeAll(async() => {server = await app.init()})
    afterAll(async() => {await server.close()})

    test('Email in request body', async() => {
        const response = await request(app)
            .post('/auth/register')
            .expect(400)
        
        expect(response.body).toEqual({'message':'Email required'})
    })

    test('Password in request body', async() => {
        const response = await request(app)
            .post('/auth/register')
            .send({'email':'someemail@email.com'})
            .expect(400)
        
        expect(response.body).toEqual({'message':'Password required'})
    })

    test('Email not available', async() => {
        let user = await db.createUser('in.use@email.com', 'aaaa!1')
        const response = await request(app)
            .post('/auth/register')
            .send({
                'email':'in.use@email.com',
                'password':'aaaa1!'
            })
            .expect(409)
        
        expect(response.body).toEqual({'message':'Email not available'})
        await user.delete()
    })

    test('Bad email format', async() => {
        const response = await request(app)
            .post('/auth/register')
            .send({'email':'bad.email.com','password':'aaaa1!'})
            .expect(422)
        
        expect(response.body).toEqual({'message':'Invalid email'})
    })

    test('Bad password format', async() => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                'email':'good.email@email.com',
                'password':'badformat'
            })
            .expect(422)
        
        expect(response.body).toEqual({'message':'Invalid password'})
    })

    test('Register successful', async() => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                'email':'some.email@email.com',
                'password':'aaaa!1'
            })
            .expect(201)

        let user = await db.getUserByEmail('some.email@email.com')
        expect(user.hasModel).toEqual(true)
        await user.delete()
    })
})

describe('Login endpoint', () => {
    let server = {}
    let user = {}

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })

    beforeEach(async() => {
        user = await db.createUser('does.exist@email.com', 'aaaa!1')
    })

    afterEach(async() => {
        await user.delete()
    })

    test('Email in request body', async() => {
        const response = await request(app)
            .post('/auth/login')
            .expect(400)
        
        expect(response.body).toEqual({'message':'Email required'})
    })

    test('Password in request body', async() => {
        const response = await request(app)
            .post('/auth/login')
            .send({'email':'someemail@email.com'})
            .expect(400)
        
        expect(response.body).toEqual({'message':'Password required'})
    })

    test('User email not found', async() => {
        const response = await request(app)
            .post('/auth/login')
            .send({'email':'does.not.exist@email.com', 'password':'password'})
            .expect(404)
        
        expect(response.body).toEqual({'message':'User email not found'})
    })

    test('Wrong password', async() => {
        const response = await request(app)
            .post('/auth/login')
            .send({'email':'does.exist@email.com','password':'bbbb!1'})
            .expect(401)
        
        expect(response.body).toEqual({'message':'Unauthorized'})
    })
 
    test('Login successful - user got accessToken', async() => {
        const response = await request(app)
            .post('/auth/login')
            .send({'email':'does.exist@email.com','password':'aaaa!1'})
            .expect(200)

        expect(response.body).toEqual(expect.objectContaining({
            accessToken: expect.any(String)
        }))
    })

    test('Login successful - refreshToken on db', async() => {
        user = await db.getUserById(user.id)
        expect(user.refreshToken).toEqual(null)

        const response = await request(app)
            .post('/auth/login')
            .send({'email':'does.exist@email.com','password':'aaaa!1'})
            .expect(200)

        const secureCookie = response.headers['set-cookie'][0]
        const cookieElements = secureCookie.split(';').map(
            item => {return item.trim()}
        )
        const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
        const jwt = jwtString.split('=')[1]
        
        user = await db.getUserById(user.id)
        expect(user.refreshToken).toEqual(jwt)
    })

    test('Secure refreshToken on browser', async() => {
        const response = await request(app)
            .post('/auth/login')
            .send({'email':'does.exist@email.com','password':'aaaa!1'})
            .expect(200)
        
        user = await db.getUserById(user.id)
        const secureCookie = response.headers['set-cookie'][0]
        const cookieElements = secureCookie.split(';').map(
            item => {return item.trim()}
        )
        const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
        const jwt = jwtString.split('=')[1]

        expect(cookieElements.includes('Secure')).toEqual(true)
        expect(jwt).toEqual(user.refreshToken)
    })
})

describe('Logout endpoint', () => {
    let server = {}
    let user = {}
    let refreshToken = ''
    let accessToken = ''

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })
    
    beforeEach(async() => {
        user = await db.createUser('user.email@email.com', 'aaaa!1')

        const responseLogin = await request(app)
            .post('/auth/login')
            .send({
                'email':'user.email@email.com',
                'password':'aaaa!1'
            })
            .expect(200)

        accessToken = responseLogin.body.accessToken

        const secureCookie = responseLogin.headers['set-cookie'][0]
        const cookieElements = secureCookie.split(';').map(
            item => {return item.trim()}
        )
        const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
        refreshToken = jwtString.split('=')[1]
    })

    afterEach(async() => {
        await user.delete()
    })

    test('RefreshToken not send', async() => {
        const response = await request(app)
            .post('/auth/logout')
            .set('authorization', accessToken)
            .expect(204)
    })

    test('User logged out', async() => {
        const response = await request(app)
        .post('/auth/logout')
        .set('authorization', accessToken)
        .set('Cookie', `jwt=${refreshToken}`)
        .expect(200)
    })

    test('Refresh token cleaned on brownser', async() => {
        const response = await request(app)
            .post('/auth/logout')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
        
        const secureCookie = response.headers['set-cookie'][0]
        const cookieElements = secureCookie.split(';').map(
            item => {return item.trim()}
        )
        const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
        const tokenName = jwtString.split('=')[0]
        const expiresDateString = cookieElements.filter(item => {return item.split('=')[0]==='Expires'})[0]
        const expiresDate = expiresDateString.split('=')[1]

        expect(tokenName).toEqual('jwt')
        expect(expiresDate).toEqual('Thu, 01 Jan 1970 00:00:00 GMT')    
        })

        test('Refresh token cleaned on database', async() => {
            const response = await request(app)
            .post('/auth/logout')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
        
        user = await db.getUserById(user.id)
        expect(user.refreshToken).toEqual('')
    })
})

describe('Refresh endpoint', () => {
    let server = {}
    let user = {}
    let refreshToken = ''
    let accessToken = ''

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })
    
    beforeEach(async() => {
        user = await db.createUser('user.email@email.com', 'aaaa!1')

        const responseLogin = await request(app)
            .post('/auth/login')
            .send({
                'email':'user.email@email.com',
                'password':'aaaa!1'
            })
            .expect(200)

        accessToken = responseLogin.body.accessToken

        const secureCookie = responseLogin.headers['set-cookie'][0]
        const cookieElements = secureCookie.split(';').map(
            item => {return item.trim()}
        )
        const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
        refreshToken = jwtString.split('=')[1]
    })

    afterEach(async() => {
        await user.delete()
    })

    test('RefreshToken not send', async() => {
        const response = await request(app)
            .get('/auth/refresh')
            .set('authorization', accessToken)
            .expect(401)
    })

    test('RefreshToken not valid', async() => {
        const response = await request(app)
            .get('/auth/refresh')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=gargabe`)
            .expect(403)
    })

    test('RefreshToken valid but not in db', async() => {
        user = await user.update({'refreshToken': 'anything'})
        const response = await request(app)
            .get('/auth/refresh')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(403)

        user = await db.getUserById(user.id)
        expect(user.refreshToken).toEqual('')
    })

    // test('Error decoding refreshToken', async() => {
        //???
    // })

    test('User id different from decoded id', async() => {
        otherUser = await db.createUser('otheruser.email@email.com', 'aaaa!1')
        const otherRefreshToken = jwt.sign(
            {'id': otherUser.id},
            config.ACCESS_TOKEN_SECRET,
            {expiresIn: REFRESH_TOKEN_EXPIRES_IN}
        )

        await user.update({'refreshToken':otherRefreshToken})

        const response = await request(app)
            .get('/auth/refresh')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=gargabe`)
            .expect(403)

        await otherUser.delete()
    })

    test('New refreshToken on db', async() => {
    const response = await request(app)
        .get('/auth/refresh')
        .set('authorization', accessToken)
        .set('Cookie', `jwt=${refreshToken}`)
        .expect(200)
    
    const secureCookie = response.headers['set-cookie'][0]
    const cookieElements = secureCookie.split(';').map(
        item => {return item.trim()}
    )
    const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
    const newRefreshToken = jwtString.split('=')[1]

    user = await db.getUserById(user.id)
    const dbRefreshToken = await user.refreshToken

    expect(dbRefreshToken).toEqual(newRefreshToken)
    })

    test('New secure refreshToken on browser', async() => {
    const response = await request(app)
        .get('/auth/refresh')
        .set('authorization', accessToken)
        .set('Cookie', `jwt=${refreshToken}`)
    
    user = await db.getUserById(user.id)
    const secureCookie = response.headers['set-cookie'][0]
    const cookieElements = secureCookie.split(';').map(
        item => {return item.trim()}
    )
    const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
    const newRefreshToken = jwtString.split('=')[1]

    expect(cookieElements.includes('Secure')).toEqual(true)
    expect(newRefreshToken).toEqual(user.refreshToken)
    })
})