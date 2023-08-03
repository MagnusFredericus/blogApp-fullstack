const { app, db } = require('../server')
const request = require('supertest')
const { makeRandomString } = require('../tests/helpers')

describe('/user/ endpoint', () => {
    let server = {}

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })

    test('No user returns 204', async() => {
        const response = await request(app)
            .get('/user/')
            .expect(204)
    })

    test('Returns one user', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')

        const response = await request(app)
            .get('/user/')
            .expect(200)

        expect(response.body[0].email).toEqual('user.email@email.com')

        await user.delete()
    })

    test('Returns many users', async() => {
        const user1 = await db.createUser('user1.email@email.com', 'aaaa!1')
        const user2 = await db.createUser('user2.email@email.com', 'aaaa!1')
        const user3 = await db.createUser('user3.email@email.com', 'aaaa!1')

        const response = await request(app)
            .get('/user/')
            .expect(200)

        expect(response.body.length).toEqual(3)

        await user1.delete()
        await user2.delete()
        await user3.delete()
    })
})

describe('/user/friends endpoint', () => {
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

    test('User cannot get friends without accessToken', async() => {
        const response = await request(app)
            .get('/user/friends/')
            .expect(401)
    })

    test('Lonely user returns 204', async() => {
        const response = await request(app)
            .get('/user/friends/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(204)
    })

    test('Returns user friend', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')
        await friend.addFriend(user.id)
        await user.acceptFriend(friend.id)

        const response = await request(app)
            .get('/user/friends/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)
        
        expect(response.body[0].email).toEqual('friend.email@email.com')

        await friend.delete()
    })

    test('Returns user friends', async() => {
        const friend1 = await db.createUser('friend1.email@email.com', 'aaaa!1')
        const friend2 = await db.createUser('friend2.email@email.com', 'aaaa!1')
        const friend3 = await db.createUser('friend3.email@email.com', 'aaaa!1')
        await friend1.addFriend(user.id)
        await friend2.addFriend(user.id)
        await friend3.addFriend(user.id)
        await user.acceptFriend(friend1.id)
        await user.acceptFriend(friend2.id)
        await user.acceptFriend(friend3.id)

        const response = await request(app)
            .get('/user/friends/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)
        
        expect(response.body.length).toEqual(3)

        await friend1.delete()
        await friend2.delete()
        await friend3.delete()
    })
})

describe('/user/friendshipinvitations endpoint', () => {
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

    test('User cannot get invitations without accessToken', async() => {
        const response = await request(app)
            .get('/user/friendshipinvitations/')
            .expect(401)
    })
    
    test('No invitations returns 204', async() => {
        const response = await request(app)
            .get('/user/friendshipinvitations/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(204)
    })

    test('Return user invitation', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')
        await friend.addFriend(user.id)

        const response = await request(app)
            .get('/user/friendshipinvitations/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)
        
        expect(response.body[0].email).toEqual('friend.email@email.com')

        await friend.delete()
    })

    test('Return user invitations', async() => {
        const friend1 = await db.createUser('friend1.email@email.com', 'aaaa!1')
        const friend2 = await db.createUser('friend2.email@email.com', 'aaaa!1')
        const friend3 = await db.createUser('friend3.email@email.com', 'aaaa!1')
        await friend1.addFriend(user.id)
        await friend2.addFriend(user.id)
        await friend3.addFriend(user.id)

        const response = await request(app)
            .get('/user/friendshipinvitations/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)
        
        expect(response.body.length).toEqual(3)

        await friend1.delete()
        await friend2.delete()
        await friend3.delete()
    })
})

describe('/user/:id endpoint', () => {
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

    test('User does not exist', async() => {
        const response = await request(app)
            .get('/user/999999999')
            .expect(204)
    })

    test('User does exist', async() => {
        const response = await request(app)
            .get(`/user/${user.id}`)
            .expect(200)

        expect(response.body.email).toEqual(user.email)
    })

    test('id parameter must be an integer', async() => {
        const response = await request(app)
            .get('/user/string')
            .expect(422)

        expect(response.body).toEqual({'message':'id must be an integer'})
    })
})

describe('/user/update endpoint', () => {
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

    test('User cannot update without accessToken', async() => {
        const response = await request(app)
            .put('/user/update/')
            .expect(401)
    })

    test('No valid body returns 400', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(400)

        expect(response.body).toEqual({'message':'name and/or lastName required in request body'})
    })

    test('Name update returns updated user', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'name':'userName'})
            .expect(200)

        expect(response.body.name).toEqual('userName')
    })

    test('Name update updates database', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'name':'userName'})
            .expect(200)

        user = await db.getUserById(user.id)
        expect(user.name).toEqual('userName')
    })

    test('LastName update returns updated user', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'lastName':'userLastName'})
            .expect(200)

        expect(response.body.lastName).toEqual('userLastName')
    })

    test('LastName update updates database', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'lastName':'userLastName'})
            .expect(200)

        user = await db.getUserById(user.id)
        expect(user.lastName).toEqual('userLastName')
    })

    test('bio update returns updated user', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'bio':'bio'})
            .expect(200)

        expect(response.body.bio).toEqual('bio')
    })

    test('bio update updates database', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'bio':'bio'})
            .expect(200)

        user = await db.getUserById(user.id)
        expect(user.bio).toEqual('bio')
    })

    test('Valid name required', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'name':makeRandomString(300)})
            .expect(422)
    })

    test('Valid lastName required', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'lastName':makeRandomString(300)})
            .expect(422)
    })

    test('Valid bio required', async() => {
        const response = await request(app)
            .put('/user/update/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'bio':makeRandomString(2100)})
            .expect(422)
    })
})

describe('/user/addfriend/:id endpoint', () => {
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

    test('User cannont add friends without accessToken', async() => {
        const response = await request(app)
            .post('/user/addfriend/2')
            .expect(401)
    })
    
    test('Invitation added returns 201', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')
        
        const response = await request(app)
            .post(`/user/addfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(201)

        await friend.delete()
    })

    test('Invitation added updates database', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')

        const response = await request(app)
            .post(`/user/addfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(201)
        
        const invitations = await friend.friendshipInvitations()
        expect(invitations[0].id).toEqual(user.id)

        await friend.delete()
    })
    
    test('Multiple invitations for different users', async() => {
        const friend1 = await db.createUser('friend1.email@email.com', 'aaaa!1')
        const friend2 = await db.createUser('friend2.email@email.com', 'aaaa!1')
        const friend3 = await db.createUser('friend3.email@email.com', 'aaaa!1')
        
        const response1 = await request(app)
            .post(`/user/addfriend/${friend1.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)

        const response2 = await request(app)
            .post(`/user/addfriend/${friend2.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)

        const response3 = await request(app)
            .post(`/user/addfriend/${friend3.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)

        const invitation1 = await friend1.friendshipInvitations()
        const invitation2 = await friend2.friendshipInvitations()
        const invitation3 = await friend3.friendshipInvitations()
        expect(invitation1[0].id).toEqual(user.id)
        expect(invitation2[0].id).toEqual(user.id)
        expect(invitation3[0].id).toEqual(user.id)

        await friend1.delete()
        await friend2.delete()
        await friend3.delete()
    })
    
    // test('how to test for 304?', async() => {

    // })

    test('id must be an integer', async() => {
        const response = await request(app)
            .post('/user/addfriend/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(422)
    })

    test('Cannot add two invitations to the same user', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')

        const response1 = await request(app)
            .post(`/user/addfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)

        const response2 = await request(app)
            .post(`/user/addfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(500)

        await friend.delete()
    })

    test('id must exist', async() => {
        const response = await request(app)
            .post('/user/addfriend/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(400)
    })
})

describe('/user/acceptfriend/:id endpoint', () => {
    let server = {}
    let user = {}
    let friend = {}
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
        friend = await db.createUser('friend.email@email.com', 'aaaa!1')

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
        await friend.delete()
    })

    test('User cannot accept friends without accessToken', async() => {
        const response = await request(app)
            .post('/user/acceptfriend/1')
            .expect(401)
    })

    test('Successful accept friend returns 201', async() => {
        await friend.addFriend(user.id)

        const response = await request(app)
            .post(`/user/acceptfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(201)
    })
    
    test('Successful accept friend updates database - created friendship', async() => {
        await friend.addFriend(user.id)

        const response = await request(app)
            .post(`/user/acceptfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)

        const acceptedFriend = await user.friends
        expect(acceptedFriend.length).toEqual(1)
    })
    
    test('Successful accept friend updates database - deleted invitation', async() => {
        await friend.addFriend(user.id)

        const response = await request(app)
            .post(`/user/acceptfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)

        const invitations = await user.friendshipInvitations()
        expect(invitations.length).toEqual(0)
    })

    test('id not found returns 304', async() => {
        const response = await request(app)
            .post('/user/acceptfriend/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(304)
    })
    
    test('If there is no invitation returns 304', async() => {
        const response = await request(app)
            .post(`/user/acceptfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(304)
    })

    test('id must be an integer', async() => {
        const response = await request(app)
            .post('/user/acceptfriend/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(422)

        expect(response.body).toEqual({'message':'id must be an integer'})
    })
})

describe('/user/rejectfriend/:id endpoint', () => {
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

    test('User cannot reject friendships without accessToken', async() => {
        const response = await request(app)
            .delete('/user/rejectfriend/1')
            .expect(401)
    })

    test('Successful rejection returns 200', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')
        await friend.addFriend(user.id)

        const response = await request(app)
            .delete(`/user/rejectfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)

        await friend.delete()
    })

    test('Successful rejection updates database - deleted invitation', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')
        await friend.addFriend(user.id)

        const response = await request(app)
            .delete(`/user/rejectfriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)

        const invitations = await user.friendshipInvitations()
        expect(invitations.length).toEqual(0)

        await friend.delete()
    })
    
    test('id not found returns 304', async() => {
        const response = await request(app)
            .delete('/user/rejectfriend/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(304)
    })
        
    test('id must be an integer', async() => {
        const response = await request(app)
            .delete('/user/rejectfriend/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(422)
    })
})

describe('/user/removefriend/:id endpoint', () => {
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

    test('User cannot remove friend without accessToken', async() => {
        const response = await request(app)
            .delete('/user/removefriend/1')
            .expect(401)
    })
    
    test('Successful remove returns 200', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')
        await friend.addFriend(user.id)
        await user.acceptFriend(friend.id)

        const response = await request(app)
            .delete(`/user/removefriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)

        await friend.delete()
    })
    
    test('Successful remove updates database - deleted friendship', async() => {
        const friend = await db.createUser('friend.email@email.com', 'aaaa!1')
        await friend.addFriend(user.id)
        await user.acceptFriend(friend.id)

        const response = await request(app)
            .delete(`/user/removefriend/${friend.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)

        const friends = await user.friends
        expect(friends.length).toEqual(0)

        await friend.delete()
    })
    
    test('id not found returns 304', async() => {
        const response = await request(app)
            .delete('/user/removefriend/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(304)
    })
    
    test('id must be an integer', async() => {
        const response = await request(app)
            .delete('/user/removefriend/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(422)
    })
})