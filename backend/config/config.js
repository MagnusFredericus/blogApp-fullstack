path = require('path')

class configBase {
    PORT = 4000
    ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_SECRET'
    
    sqlConfig = {
        HOST: path.join(__dirname, '..', 'model/SQLDatabase/sequelize/sequelizeORM', './db.sqlite'),
        // PORT: '8191',
        USER: 'root',
        PASSWORD: '',
        DB: 'db',
        dialect: 'sqlite',
        pool: {
            max: 50,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }

    corsOptions = () => {
        const allowedOrigins = ['http://localhost:3000']
        const options = {
            credentials:true, 
            origin: allowedOrigins
        }
        return options
    }
}

class configDev extends configBase {
    constructor() {
        super()
    }
}

class configTest extends configBase {
    constructor() {
        super()
        this.sqlConfig.HOST = path.join(__dirname, '..', 'model/SQLDatabase/sequelize/sequelizeORM', './db_test.sqlite')
    }
}

class configProd extends configBase {
    constructor() {
        super()

        this.sqlConfig.HOST = 'postgresql'
        // this.sqlConfig.PORT = '5432'
        this.sqlConfig.USER = 'app'
        this.sqlConfig.PASSWORD = 'password'
        this.sqlConfig.DB = 'app'
        this.sqlConfig.dialect = 'postgres'
    }
}

class configFactory {
    NODE_ENV = ''

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV || 'dev'
    }

    createConfig() {
        switch(this.NODE_ENV) {
            case 'dev':
                return new configDev()
            case 'test':
                return new configTest()
            case 'prod':
                return new configProd()
        }
    }
}

const Factory = new configFactory()
const config = Factory.createConfig()

module.exports = config