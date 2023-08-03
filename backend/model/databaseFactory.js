const sequelizeImplementation = require('./SQLDatabase/sequelize/databaseImplementation')

class databaseFactory {
    //verity object interface
    constructor(config) {  }

    createDatabase() {
        const sequelizeImp = new sequelizeImplementation()
        return sequelizeImp
    }
}

module.exports = databaseFactory