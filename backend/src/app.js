const express = require('express');
const clientRoutes = require('./routes/client.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());
app.use('/api/clients', clientRoutes);
app.use(errorMiddleware);

module.exports = app;
