const required = [
    'PORT',
    'NODE_ENV',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'SESSION_SECRET'
  ];
  
  for (const k of required) {
    if (!process.env[k]) throw new Error(`Missing env var: ${k}`);
  }
  
  module.exports = {
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV,
    db: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    sessionSecret: process.env.SESSION_SECRET
  };