const { Sequelize } = require('sequelize');

// Support both local development and Docker environment
const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || 'ecom';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || null;
const dbPort = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    timezone: '+07:00',
    dialectOptions: {
        charset: 'utf8mb4'
    }
});

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`✓ Connected to MySQL at ${dbHost}:${dbPort}/${dbName}`);
    } catch (error) {
        console.error('✗ Unable to connect to the database:', error);
        process.exit(1);
    }
}

module.exports = connectDB;