const config = require('../config/config')
const databaseFactory = require('./databaseFactory')

dbFactory = new databaseFactory(config)
database = dbFactory.createDatabase()

module.exports = database