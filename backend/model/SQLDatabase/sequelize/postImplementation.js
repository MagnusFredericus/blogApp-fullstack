const postInterface = require('../../postInterface')
const sequelizeORM = require('./sequelizeORM/sequelizeorm')
const Comment = require('./commentImplementation')

class Post extends postInterface {
    #post = {}
    #hasModel = false
    get id() { return this.#post.id }
    get userId() { return this.#post.user_id}
    get hasModel() { return this.#hasModel}
    get title() { return this.#post.title }
    get content() { return this.#post.content }
    get views() { return this.#post.views }
    get likes() { return this.#post.likes }
    get createdAt() { return this.#post.created_at }
    get updatedAt() { return this.#post.updated_at }

    constructor(sequelizePost) {
        super()
        if(sequelizePost instanceof sequelizeORM.Post) {
            this.#post = sequelizePost
            this.#hasModel = true
        } else {
            this.#post = {}
            this.#hasModel = false
        }
    }

    get comments() {
        return (async() => {
            try {
                let sequelizeComments = await sequelizeORM.Comment.findAll({
                    where: {post_id: this.id}
                })
                let comments = sequelizeComments.map(sequelizeComment => {
                    return new Comment(sequelizeComment)
                })
                return comments
            } catch(e) {
                throw(e)
            }
        })()
    }

    async _update(data) {
        try {
            await this.#post.update(data)
            return this
        } catch(e) {
            throw(e)
        }
    }

    async _delete() {
        try {
            await this.#post.destroy()
            this.#post = {}
            this.#hasModel = false
            return {}
        } catch(e) {
            throw(e)
        }
    }
}

module.exports = Post