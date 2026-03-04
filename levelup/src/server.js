require('dotenv').config();
require('./config/env'); // validates env
const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => console.log(`LevelUp running on http://localhost:${port}`));