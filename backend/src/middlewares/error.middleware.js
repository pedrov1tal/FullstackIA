function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Erro interno do servidor.' : error.message;
  res.status(statusCode).json({ error: message });
}

module.exports = errorMiddleware;
