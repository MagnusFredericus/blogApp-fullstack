const { app, db } = require('../server')
const request = require('supertest')

//include tests for cors

describe('Error handlers', () => {
    test('Non existent route returns message to user', async() => {
        const response = await request(app)
            .get('/garbege/route/1192932929102')
            .expect(404)

        expect(response.body).toEqual({'message':'not found'})
    })
})