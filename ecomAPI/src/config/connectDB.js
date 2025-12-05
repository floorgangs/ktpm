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

// Retry configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let connectDB = async () => {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
        try {
            await sequelize.authenticate();
            console.log(`✓ Connected to MySQL at ${dbHost}:${dbPort}/${dbName}`);
            return;
        } catch (error) {
            retries++;
            console.log(`✗ Unable to connect to database (attempt ${retries}/${MAX_RETRIES}): ${error.message}`);
            
            if (retries < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
                await sleep(RETRY_DELAY);
            } else {
                console.error('✗ Max retries reached. Could not connect to database.');
                process.exit(1);
            }
        }
    }
}

module.exports = connectDB;