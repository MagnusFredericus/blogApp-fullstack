const { app, db } = require('../server')
const request = require('supertest')
const { makeRandomString } = require('../tests/helpers')

describe('/posts/ endpoint', () => {
    let server = {}

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })

    test('No posts returns 204', async() => {
        const response = await request(app)
            .get('/post/')
            .expect(204)
    })

    test('Returns one post', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')
        const post = await user.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get('/post/')
            .expect(200)

        expect(response.body[0].title).toEqual('title')

        await user.delete()
        await post.delete()
    })

    test('Returns many posts', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')
        const post1 = await user.createPost({'title':'title', 'content':'content'})
        const post2 = await user.createPost({'title':'title', 'content':'content'})
        const post3 = await user.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get('/post/')
            .expect(200)

        expect(response.body.length).toEqual(3)

        await user.delete()
        await post1.delete()
        await post2.delete()
        await post3.delete()
    })

})

describe('/posts/mostread endpoint', () => {
    let server = {}

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })

    test('No posts returns 204', async() => {
        const response = await request(app)
            .get('/post/mostread')
            .expect(204)
    })

    test('Returns one post', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')
        const post = await user.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get('/post/mostread')
            .expect(200)

        expect(response.body[0].title).toEqual('title')

        await user.delete()
        await post.delete()
    })

    test('Returns many posts', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')
        const post1 = await user.createPost({'title':'title', 'content':'content'})
        const post2 = await user.createPost({'title':'title', 'content':'content'})
        const post3 = await user.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get('/post/mostread')
            .expect(200)

        expect(response.body.length).toEqual(3)

        await user.delete()
        await post1.delete()
        await post2.delete()
        await post3.delete()
    })

    test('Returns posts in right order', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')
        const post1 = await user.createPost({'title':'title1', 'content':'content'})
        const post2 = await user.createPost({'title':'title2', 'content':'content'})
        const post3 = await user.createPost({'title':'title3', 'content':'content'})

        await post1.update({'views':1})
        await post2.update({'views':2})
        await post3.update({'views':3})

        const response = await request(app)
            .get('/post/mostread')
            .expect(200)

        expect(response.body.length).toEqual(3)
        expect(response.body[0].title).toEqual('title3')
        expect(response.body[1].title).toEqual('title2')
        expect(response.body[2].title).toEqual('title1')

        await user.delete()
        await post1.delete()
        await post2.delete()
        await post3.delete()
    })
})

describe('/posts/user/:id endpoint', () => {
    let server = {}
    let user = {}

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })

    beforeEach(async() => {
        user = await db.createUser('user.email@email.com', 'aaaa!1')
    })

    afterEach(async() => {
        await user.delete()
    })

    test('If user has no post returns 204', async() => {
        const response = await request(app)
            .get(`/post/user/${user.id}`)
            .expect(204)
    })

    test('Returns user post', async() => {
        const post = await user.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get(`/post/user/${user.id}`)
            .expect(200)

        expect(response.body[0].title).toEqual('title')

        await post.delete()
    })

    test('Returns user posts', async() => {
        const post1 = await user.createPost({'title':'title', 'content':'content'})
        const post2 = await user.createPost({'title':'title', 'content':'content'})
        const post3 = await user.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get(`/post/user/${user.id}`)
            .expect(200)

        expect(response.body.length).toEqual(3)

        await post1.delete()
        await post2.delete()
        await post3.delete()
    })

    test('Returns only one user posts per call', async() => {
        const post1 = await user.createPost({'title':'title', 'content':'content'})
        const post2 = await user.createPost({'title':'title', 'content':'content'})
        const post3 = await user.createPost({'title':'title', 'content':'content'})

        const anotherUser = await db.createUser('anotherUser.email@email.com', 'aaaa!1')
        const post4 = await anotherUser.createPost({'title':'title', 'content':'content'})
        const post5 = await anotherUser.createPost({'title':'title', 'content':'content'})
        const post6 = await anotherUser.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get(`/post/user/${user.id}`)
            .expect(200)

        expect(response.body.length).toEqual(3)
        expect(response.body[0].userId).toEqual(user.id)

        await anotherUser.delete()
        await post1.delete()
        await post2.delete()
        await post3.delete()
        await post4.delete()
        await post5.delete()
        await post6.delete()
    })
    
    test('If there is no user with id provided returns 204', async() => {
        const response = await request(app)
            .get('/post/user/999999999')
            .expect(204)
    })
    
    test('id must be an integer', async() => {
        const response = await request(app)
            .get('/post/user/string')
            .expect(422)
    })
})

describe('/posts/:id endpoint', () => {
    let server = {}
    let user = {}

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })

    beforeEach(async() => {
        user = await db.createUser('user.email@email.com', 'aaaa!1')
    })

    afterEach(async() => {
        await user.delete()
    })

    test('If there is no post with id provided returns 204', async() => {
        const response = await request(app)
            .get('/post/999999999')
            .expect(204)
    })

    test('Returs post', async() => {
        const post = await user.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get(`/post/${post.id}`)
            .expect(200)

        expect(response.body.title).toEqual('title')

        await post.delete()
    })

    test('id must be an integer', async() => {
        const response = await request(app)
            .get('/post/string')
            .expect(422)

        expect(response.body).toEqual({'message':'id must be an integer'})
    })
})

describe('/posts/create endpoint', () => {
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

    test('User cannot create post without accessToken', async() => {
        const response = await request(app)
        .post('/post/create/')
        .send({
            'title':'title',
            'content':'content'
        })
        .expect(401)
    })

    test('No title in body returns 400', async() => {
        const response = await request(app)
        .post('/post/create/')
        .set('authorization', accessToken)
        .set('Cookie', `jwt=${refreshToken}`)
        .expect(400)
    })
    
    test('No content in body returns 400', async() => {
        const response = await request(app)
        .post('/post/create/')
        .set('authorization', accessToken)
        .set('Cookie', `jwt=${refreshToken}`)
        .send({
            'title':'title'
        })
        .expect(400)
    })
    
    test('Post created returns 200', async() => {
        const response = await request(app)
            .post('/post/create/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':'title',
                'content':'content'
            })
            .expect(200)

        expect(response.body.title).toEqual('title')
    })
    
    test('Post created updates database with right author', async() => {
        const response = await request(app)
            .post('/post/create/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':'title',
                'content':'content'
            })

        const userPosts = await user.posts
        const userPost = userPosts[0]
        expect(userPost.userId).toEqual(user.id)
    })
    
    test('Can create many posts', async() => {
        const response = await request(app)
            .post('/post/create/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':'title',
                'content':'content'
            })
        const response2 = await request(app)
            .post('/post/create/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':'title',
                'content':'content'
            })
        const response3 = await request(app)
            .post('/post/create/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':'title',
                'content':'content'
            })

        const userPosts = await user.posts
        expect(userPosts.length).toEqual(3)
    })
    
    // test('', async() => {
    //     how to test 304??
    // })

    test('Valid title required', async() => {
        const response = await request(app)
            .post('/post/create/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':makeRandomString(300),
                'content':'content'
            })
            .expect(422)

        expect(response.body).toEqual({'message':'valid title required'})
    })

    test('Valid content required', async() => {
        const response = await request(app)
            .post('/post/create/')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':'title',
                'content':makeRandomString(2100)
            })
            .expect(422)

    expect(response.body).toEqual({'message':'valid content required'})
    })
})

describe('/posts/:update endpoint', () => {
    let server = {}
    let user = {}
    let post = {}
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
        post = await user.createPost({'title':'title', 'content':'content'})

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
        await post.delete()
    })

    test('User cannot update without accessToken', async() => {
        const response = await request(app)
            .put(`/post/update/${post.id}`)
            .send({
                'title':'title',
                'content':'content'
            })
            .expect(401)
    })
    
    test('Valid request body required', async() => {
        const response = await request(app)
            .put(`/post/update/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(400)
    })
    
    test('Successful title update returns 200', async() => {
        const response = await request(app)
            .put(`/post/update/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':'title2',
            })
            .expect(200)

        expect(response.body.title).toEqual('title2')
    })
    
    test('Successful title update updates database', async() => {
        const response = await request(app)
            .put(`/post/update/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':'title2',
            })
        
        post = await db.getPostById(post.id)
        expect(post.title).toEqual('title2')
    })
    
    test('Successful content update returns 200', async() => {
        const response = await request(app)
            .put(`/post/update/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'content':'content2'
            })
            .expect(200)

    expect(response.body.content).toEqual('content2')
    })
    
    test('Successful content update updates database', async() => {
        const response = await request(app)
            .put(`/post/update/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'content':'content2',
            })
        
        post = await db.getPostById(post.id)
        expect(post.content).toEqual('content2')
    })
    
    test('User cannot update posts of other users', async() => {
        anotherUser = await db.createUser('anotherUser.email@email.com', 'aaaa!1')

        const responseLogin = await request(app)
            .post('/auth/login')
            .send({
                'email':'anotherUser.email@email.com',
                'password':'aaaa!1'
            })
            .expect(200)

        anotherAccessToken = responseLogin.body.accessToken

        const secureCookie = responseLogin.headers['set-cookie'][0]
        const cookieElements = secureCookie.split(';').map(
            item => {return item.trim()}
        )
        const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
        anotherRefreshToken = jwtString.split('=')[1]

        const response = await request(app)
            .put(`/post/update/${post.id}`)
            .set('authorization', anotherAccessToken)
            .set('Cookie', `jwt=${anotherRefreshToken}`)
            .send({
                'title':'title2',
                'content':'content2',
            })
            .expect(403)

        post = await db.getPostById(post.id)
        expect(post.title).toEqual('title')

        await anotherUser.delete()
    })
    
    test('Valid title required', async() => {
        const response = await request(app)
            .put(`/post/update/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({
                'title':makeRandomString(300),
                'content':'content2',
            })
    })
    
    test('Valid content required', async() => {
        const response = await request(app)
        .put(`/post/update/${post.id}`)
        .set('authorization', accessToken)
        .set('Cookie', `jwt=${refreshToken}`)
        .send({
            'title':'title2',
            'content':makeRandomString(2100)
        })
    })
})

describe('/posts/:delete endpoint', () => {
    let server = {}
    let user = {}
    let post = {}
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
        post = await user.createPost({'title':'title', 'content':'content'})

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
        await post.delete()
    })

    test('User cannot delete post without accessToken', async() => {
        const response = await request(app)
            .delete(`/post/delete/${post.id}`)
            .expect(401)
    })
    
    test('If there is not post with provided id returns 304', async() => {
        const response = await request(app)
            .delete('/post/delete/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(304)
    })
    
    test('Successful delete returns 200', async() => {
        const response = await request(app)
            .delete(`/post/delete/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)
    })
    
    test('Successful delete updates db', async() => {
        const postId = post.id

        const response = await request(app)
            .delete(`/post/delete/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)

        const nonExistentPost = await db.getPostById(postId)
        expect(nonExistentPost.hasModel).toEqual(false)
    })
    
    test('User cannot delete posts of other users', async() => {
        anotherUser = await db.createUser('anotherUser.email@email.com', 'aaaa!1')

        const responseLogin = await request(app)
            .post('/auth/login')
            .send({
                'email':'anotherUser.email@email.com',
                'password':'aaaa!1'
            })
            .expect(200)
        
        const anotherAccessToken = responseLogin.body.accessToken

        const secureCookie = responseLogin.headers['set-cookie'][0]
        const cookieElements = secureCookie.split(';').map(
            item => {return item.trim()}
        )
        const jwtString = cookieElements.filter(item => {return item.split('=')[0]==='jwt'})[0]
        const anotherRefreshToken = jwtString.split('=')[1]
        
        const response = await request(app)
            .delete(`/post/delete/${post.id}`)
            .set('authorization', anotherAccessToken)
            .set('Cookie', `jwt=${anotherRefreshToken}`)
            .expect(403)

        let postStillLives = await db.getPostById(post.id)
        expect(postStillLives.hasModel).toEqual(true)
        
        await anotherUser.delete()
    })

    test('id must be an integer', async() => {
        const response = await request(app)
            .delete('/post/delete/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(422)
    })
})

describe('/posts/like/:id endpoint', () => {
    let server = {}
    let user = {}
    let post = {}
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
        post = await user.createPost({'title':'title', 'content':'content'})

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
        await post.delete()
    })

    test('User cannot like posts without accessToken', async() => {
        const response = await request(app)
            .post(`/post/like/${post.id}`)
            .expect(401)
    })
    
    test('Successful like returns 201', async() => {
        const response = await request(app)
            .post(`/post/like/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(201)
    })
    
    test('Successful like updates database', async() => {
        const response = await request(app)
            .post(`/post/like/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)

        const count = await db.getTotalPostLikeById(post.id)
        const updatedPost = await db.getPostById(post.id)

        expect(count).toEqual(1)
        expect(updatedPost.likes).toEqual(1)
    })
    
    test('If there is no post with provided id returns 304', async() => {
        const response = await request(app)
            .post('/post/like/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(304)
    })
    
    test('id must be an integer', async() => {
        const response = await request(app)
            .post('/post/like/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(422)
    })
    
    test('User can like each post just one time', async() => {
        const response1 = await request(app)
        .post(`/post/like/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(201)

        const response2 = await request(app)
        .post(`/post/like/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(400)
        
        const count = await db.getTotalPostLikeById(post.id)
        expect(count).toEqual(1)
    })
})