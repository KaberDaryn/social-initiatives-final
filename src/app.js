const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const { env } = require('./config/env');
const { buildCorsOptions } = require('./config/cors');
const { apiRouter } = require('./routes');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', true);

app.use(helmet());
app.use(compression());
app.use(cors(buildCorsOptions(env.corsOrigin)));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Serve frontend
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.use('/api', apiRouter);

// SPA-like fallback for direct navigation (when hosting frontend on the same server)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
