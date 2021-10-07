const sqlConfig = {
  user: 'sa',//process.env.DB_USER,
  password: '1234', //process.env.DB_PWD,
  database: 'experiment',//process.env.DB_NAME,
  server: 'CLASHER',
  port: 1433,
  requestTimeout : 5000,
  connectionTimeout: 15000,
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000
  },
    options: {
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

module.exports = sqlConfig;
