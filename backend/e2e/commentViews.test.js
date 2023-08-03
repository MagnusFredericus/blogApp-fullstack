const { app, db } = require('../server')
const request = require('supertest')
const { makeRandomString } = require('../tests/helpers')

describe('/comment/:id endpoit', () => {
    let server = {}

    beforeAll(async() => {
        server = await app.init()
    })

    afterAll(async() => {
        await server.close()
    })

    test('If there is no post with provided id returns 204', async() => {
        const response = await request(app)
            .get('/comment/1')
            .expect(204)
    })
    
    test('If there is no comments returns 204', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')
        const post = await user.createPost({'title':'title', 'content':'content'})

        const response = await request(app)
            .get(`/comment/${post.id}`)
            .expect(204)

        await user.delete()
        await post.delete()
    })
    
    test('Returns one comment', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')
        const post = await user.createPost({'title':'title', 'content':'content'})
        const comment = await user.createComment({
            'postId':post.id,
            'content':'comment',
            'author':user.email
        })

        const response = await request(app)
            .get(`/comment/${post.id}`)
            .expect(200)

        expect(response.body[0].content).toEqual('comment')

        await user.delete()
        await post.delete()
        await comment.delete()
    })
    
    test('Returns many comments', async() => {
        const user = await db.createUser('user.email@email.com', 'aaaa!1')
        const post = await user.createPost({'title':'title', 'content':'content'})
        const comment1 = await user.createComment({
            'postId':post.id,
            'content':'comment',
            'author':user.email
        })
        const comment2 = await user.createComment({
            'postId':post.id,
            'content':'comment',
            'author':user.email
        })
        const comment3 = await user.createComment({
            'postId':post.id,
            'content':'comment',
            'author':user.email
        })

        const response = await request(app)
            .get(`/comment/${post.id}`)

        expect(response.body.length).toEqual(3)

        await user.delete()
        await post.delete()
        await comment1.delete()
        await comment2.delete()
        await comment3.delete()
    })
    
    test('id must be an integer', async() => {
        const response = await request(app)
            .get('/comment/string')
            .expect(422)
    })
})

describe('/comment/create/:id endpoit', () => {
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

    test('User cannot create comment without accessToken', async() => {
        const response = await request(app)
            .get(`/comment/create/${post.id}`)
            .expect(401)
    })

    test('No content in request body returns 400', async() => {
        const response = await request(app)
            .post(`/comment/create/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(400)
    })

    test('Comment created returns 200', async() => {
        const response = await request(app)
            .post(`/comment/create/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':'comment'})
            .expect(200)
    })
    
    test('Comment created updates database', async() => {
        const response = await request(app)
            .post(`/comment/create/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':'comment'})
            .expect(200)
    })
    
    // test('', async() => {
    //     how to test 204?
    // })
    
    test('id must be an integer', async() => {
        const response = await request(app)
            .post('/comment/create/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':'comment'})
            .expect(422)
    })
    
    test('valid content required', async() => {
        const response = await request(app)
            .post(`/comment/create/${post.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':makeRandomString(2100)})
            .expect(422)
    })
    
    test('Cannot comment if post no found', async() => {
        const response = await request(app)
            .post('/comment/create/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':'comment'})
            .expect(400)
    })
})

describe('/comment/update/:id endpoit', () => {
    let server = {}
    let user = {}
    let post = {}
    let comment = {}
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
        comment = await user.createComment({
            'postId':post.id,
            'content':'comment',
            'author':user.email
        })

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
        await comment.delete()
    })

    test('User cannot update comment without accessToken', async() => {
        const response = await request(app)
            .put(`/comment/update/${comment.id}`)
            .send({'content':'comment2'})
            .expect(401)
    })
    
    test('No content in request body returns 400', async() => {
        const response = await request(app)
            .put(`/comment/update/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(400)
    })
    
    test('User cannot update comment of other user', async() => {
        const anotherUser = await db.createUser('anotherUser.email@email.com', 'aaaa!1')
        let anotherComment = await anotherUser.createComment({
            'postId':post.id,
            'content':'another comment',
            'author':anotherUser.email
        })

        const response = await request(app)
            .put(`/comment/update/${anotherComment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':'comment2'})
            .expect(403)

        anotherComment = await db.getCommentById(anotherComment.id)
        expect(anotherComment.content).toEqual('another comment')

        await anotherUser.delete()
        await anotherComment.delete()
    })
    
    test('Successful update returns 200', async() => {
        const response = await request(app)
            .put(`/comment/update/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':'comment2'})
            .expect(200)
    })
    
    test('Successful update updates database', async() => {
        const response = await request(app)
            .put(`/comment/update/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':'comment2'})
            .expect(200)

        comment = await db.getCommentById(comment.id)
        expect(comment.content).toEqual('comment2')
    })
    
    // test('', async() => {
    //     how to test 304?
    // })
    
    test('id must be an integer', async() => {
        const response = await request(app)
            .put('/comment/update/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .send({'content':'comment2'})
            .expect(422)

        expect(response.body).toEqual({'message':'id must be an integer'})
    })
    
    test('Valid content required', async() => {
        const response = await request(app)
        .put(`/comment/update/${comment.id}`)
        .set('authorization', accessToken)
        .set('Cookie', `jwt=${refreshToken}`)
        .send({'content':makeRandomString(2100)})
        .expect(422)
    })
})

describe('/comment/delete/:id endpoit', () => {
    let server = {}
    let user = {}
    let post = {}
    let comment = {}
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
        comment = await user.createComment({
            'postId':post.id,
            'content':'comment',
            'author':user.email
        })

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
        await comment.delete()
    })

    test('User cannot delete without accessToken', async() => {
        const response = await request(app)
            .delete(`/comment/delete/${comment.id}`)
            .expect(401)
    })
    
    test('User cannot delete comment of other user', async() => {
        const anotherUser = await db.createUser('anotherUser.email@email.com', 'aaaa!1')
        let anotherComment = await anotherUser.createComment({
            'postId':post.id,
            'content':'another comment',
            'author':anotherUser.email
        })

        const response = await request(app)
            .delete(`/comment/delete/${anotherComment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(403)

        anotherComment = await db.getCommentById(anotherComment.id)
        expect(anotherComment.content).toEqual('another comment')

        await anotherUser.delete()
        await anotherComment.delete()
    })
    
    test('If there is no comment with provided id returns 304', async() => {
        const response = await request(app)
            .delete('/comment/delete/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(304)
    })
    
    test('Successful delete returns 200', async() => {
        const response = await request(app)
            .delete(`/comment/delete/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)
    })
    
    test('Successful delete updates database', async() => {
        const commentId = comment.id

        const response = await request(app)
            .delete(`/comment/delete/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(200)

        const nonExistentComment = await db.getCommentById(commentId)
        expect(nonExistentComment.hasModel).toEqual(false)
    })
    
    test('id must be an integer', async() => {
        const response = await request(app)
            .delete('/comment/delete/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(422)
    })
})

describe('/comment/like/:id endpoit', () => {
    let server = {}
    let user = {}
    let post = {}
    let comment = {}
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
        comment = await user.createComment({
            'postId':post.id,
            'content':'comment',
            'author':user.email
        })

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
        await comment.delete()
    })


    test('User cannot like without accessToken', async() => {
        const response = await request(app)
            .post(`/comment/like/${comment.id}`)
            .expect(401)
    })

    test('Successful update returns 201', async() => {
        const response = await request(app)
            .post(`/comment/like/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(201)
    })
    
    test('Successful update updates database', async() => {
        const response = await request(app)
            .post(`/comment/like/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
        
        const count = await db.getTotalCommentLikeById(comment.id)
        expect(count).toEqual(1)
    })
    
    test('If there is no comment with provided id returns 304', async() => {
        const response = await request(app)
            .post('/comment/like/999999999')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(304)
    })
    
    test('id must be an integer', async() => {
        const response = await request(app)
            .post('/comment/like/string')
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(422)
    })
    
    test('User cannot like same comment more than one time', async() => {
        const response1 = await request(app)
            .post(`/comment/like/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(201)  

        const response2 = await request(app)
            .post(`/comment/like/${comment.id}`)
            .set('authorization', accessToken)
            .set('Cookie', `jwt=${refreshToken}`)
            .expect(400)
    })
})