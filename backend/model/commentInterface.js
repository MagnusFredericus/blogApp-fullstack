const { inputError } = require("../error/error")

const MAX_LENGTH_CONTENT = 2000

class commentInterface {
    #comment = {}
    #hasModel = false

    get id() { throw new Error('getters must be implemented') }
    get userId() { throw new Error('getters must be implemented') }
    get author() { throw new Error('getters must be implemented') }
    get postId() { throw new Error('getters must be implemented') }
    get hasModel() { throw new Error('getters must be implemented') }
    get content() { throw new Error('getters must be implemented') }
    get likes() { throw new Error('getters must be implemented') }
    get createdAt() { throw new Error('getters must be implemented') }
    get updatedAt() { throw new Error('getters must be implemented') }

    constructor() {}

    async update(data) {
        if(data.content.length > MAX_LENGTH_CONTENT) {
            throw new inputError('content')
        }
        return await this._update(data)
    }
    async _update(data) {throw new Error('_update must be implemented')}


    async delete(id) {
        return await this._delete()
    }
    async _delete() {throw new Error('_delete must be implemented')}


    async toJSON() {
        return ({
            'id': this.id,
            'userId': this.userId,
            'author': this.author,
            'postId': this.postId,
            'content': this.content,
            'likes': this.likes,
            'createdAt': this.createdAt,
            'updatedAt': this.updatedAt
        })
    }
}

module.exports = commentInterface