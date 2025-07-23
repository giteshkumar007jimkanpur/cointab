const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1/cointab');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error connecting to the database.'))

db.once('open', () => console.log(`Connect to the database ${db.name}`));

module.exports = db;