const { inputError } = require("../error/error")

const REGEX_EMAIL = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const REGEX_PASSWORD = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/

//ABSTRACT
class databaseInterface {
    User = {}
    Post = {}
    Comment = {}

    constructor() {}

    //==== DATABASE ====
    async syncDB(options) {
        throw new Error('sync method must be implemented')
    }

    //==== USERS ====
    async createUser(email, password) {
        if(!REGEX_EMAIL.test(email)) {
            throw new inputError('email')
        }
        
        if(!REGEX_PASSWORD.test(password)) {
            throw new inputError('password')
        }
        
        return this._createUser(email, password)
    }
    async _createUser(email, password) {throw new Error('_create methods must be implemented')}


    async getUserById(id) {
        if(!isNaN(id)) {
            return await this._getUserById(id)
        } else {
            throw new inputError('id')
        }
    }
    async _getUserById() { throw new Error('_getUserById must be implemented')}


    async getUserByEmail(email) {
        if(REGEX_EMAIL.test(email)) {
            return await this._getUserByEmail(email)
        } else {
            throw new inputError('email')
        }
    }
    async _getUserByEmail(email) {throw new Error('_get methods must be implemented')}


    async getUserByRefreshToken(refreshToken) {
        //checks
        return await this._getUserByRefreshToken(refreshToken)
    }
    async _getUserByRefreshToken(refreshToken) {throw new Error('_getUserByRefreshToken must be implemented')}
    

    async getAllUsers() {throw new Error('getAllUsers must be implemented')}


    //==== POSTS ====
    async getPostById(id) {
        if(!isNaN(id)) {
            return await this._getPostById(id)
        } else {
            throw new inputError('id')
        }
    }
    async _getPostById(id) {throw new Error('_getPostById must be implemented')}


    async getPostByIdUpdateViews(id) {
        if(!isNaN(id)) {
            return await this._getPostByIdUpdateViews(id)
        } else {
            throw new inputError('id')
        }
    }
    async _getPostByIdUpdateViews(id) {throw new Error('_getPostById must be implemented')}


    async getPostsByUser(id) {
        if(!isNaN(id)) {
            return await this._getPostsByUser(id)
        } else {
            throw new inputError('id')
        }
    }
    async _getPostsByUser(id) {throw new Error('_getPostsByUser must be implemented')}

    
    async getAllPosts() {throw new Error('getAllPosts must be implemented')}
    

    async getTotalPostLikeById(id) {
        if(!isNaN(id)) {
            return await this._getTotalPostLikeById(id)
        } else {
            throw new inputError('id')
        }
    }
    async _getTotalPostLikeById(id) {throw new Error('getPostLikeById must be implemented')}

    //==== COMMENTS ====
    async getCommentById(id) {
        if(!isNaN(id)) {
            return await this._getCommentById(id)
        } else {
            throw new inputError('id')
        }
    }
    async _getCommentById(id) {throw new Error('_getCommentById must be implemented')}


    async getTotalCommentLikeById(id) {
        if(!isNaN(id)) {
            return await this._getTotalCommentLikeById(id)
        } else {
            throw new inputError('id')
        }
    }
    async _getTotalCommentLikeById(id) {throw new Error('getTotalCommentLikeById must be implemented')}
}

module.exports = databaseInterface