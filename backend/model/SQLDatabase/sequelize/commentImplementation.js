const commentInterface = require('../../commentInterface')
const orm = require('./sequelizeORM/sequelizeorm')

class Comment extends commentInterface {
    #comment = {}
    #hasModel = false

    get id() { return this.#comment.id }
    get userId() { return this.#comment.user_id }
    get author() { return this.#comment.author }
    get postId() { return this.#comment.post_id }
    get hasModel() { return this.#hasModel }
    get content() { return this.#comment.content }
    get likes() { return this.#comment.likes }
    get createdAt() { return this.#comment.created_at }
    get updatedAt() { return this.#comment.updated_at }

    constructor(sequelizeComment) {
        super()
        if(sequelizeComment instanceof orm.Comment) {
            this.#comment = sequelizeComment
            this.#hasModel = true
        } else {
            this.#comment = {}
            this.#hasModel = false
        }
    }

    async _update(data) {
        data['user_id'] = data['userId']
        data['post_id'] = data['postId']
        delete data['userId']
        delete data['postId']

        try {
            await this.#comment.update(data)
            return this
        } catch(e) {
            throw(e)
        }
    }

    async _delete() {
        try {
            await this.#comment.destroy()
            this.#comment = {}
            this.#hasModel = false
            return {}
        } catch(e) {
            throw(e)
        }
    }
}

module.exports = Comment