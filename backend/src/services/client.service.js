const prisma = require('../lib/prisma');
const HttpError = require('../utils/http-error');

const allowedFields = new Set(['name', 'email', 'phone', 'document']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeOptional(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Os campos email e document devem ser textos.');
  }
  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}

function validateFields(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'O corpo da requisição deve ser um objeto JSON.');
  }

  const unknownFields = Object.keys(input).filter((field) => !allowedFields.has(field));
  if (unknownFields.length) {
    throw new HttpError(400, `Campo(s) não permitido(s): ${unknownFields.join(', ')}.`);
  }

  if (partial && Object.keys(input).length === 0) {
    throw new HttpError(400, 'Informe ao menos um campo para atualizar.');
  }

  const data = {};

  if (!partial || Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string' || input.name.trim().length === 0) {
      throw new HttpError(400, 'O campo name é obrigatório e deve ser um texto não vazio.');
    }
    if (input.name.trim().length > 150) {
      throw new HttpError(400, 'O campo name deve ter no máximo 150 caracteres.');
    }
    data.name = input.name.trim();
  }

  if (!partial || Object.hasOwn(input, 'phone')) {
    if (typeof input.phone !== 'string' || input.phone.trim().length === 0) {
      throw new HttpError(400, 'O campo phone é obrigatório e deve ser um texto não vazio.');
    }
    if (input.phone.trim().length > 30) {
      throw new HttpError(400, 'O campo phone deve ter no máximo 30 caracteres.');
    }
    data.phone = input.phone.trim();
  }

  if (!partial || Object.hasOwn(input, 'email')) {
    data.email = normalizeOptional(input.email);
    if (data.email && (data.email.length > 255 || !emailPattern.test(data.email))) {
      throw new HttpError(400, 'Informe um endereço de email válido com até 255 caracteres.');
    }
    if (data.email) data.email = data.email.toLowerCase();
  }

  if (!partial || Object.hasOwn(input, 'document')) {
    data.document = normalizeOptional(input.document);
    if (data.document && data.document.length > 30) {
      throw new HttpError(400, 'O campo document deve ter no máximo 30 caracteres.');
    }
  }

  return data;
}

function handlePrismaError(error) {
  if (error.code === 'P2002') {
    throw new HttpError(409, 'Já existe um cliente com esse email ou documento.');
  }
  if (error.code === 'P2003') {
    throw new HttpError(409, 'Não é possível excluir este cliente porque há registros vinculados.');
  }
  if (error.code === 'P2025') {
    throw new HttpError(404, 'Cliente não encontrado.');
  }
  throw error;
}

function validateId(id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new HttpError(400, 'ID do cliente inválido.');
  }
}

async function createClient(input) {
  const data = validateFields(input);
  try {
    return await prisma.client.create({ data });
  } catch (error) {
    handlePrismaError(error);
  }
}

async function listClients({ page, limit }) {
  const currentPage = Number(page ?? 1);
  const pageSize = Number(limit ?? 20);
  if (!Number.isInteger(currentPage) || currentPage < 1) {
    throw new HttpError(400, 'page deve ser um inteiro maior que zero.');
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new HttpError(400, 'limit deve ser um inteiro entre 1 e 100.');
  }

  const [clients, total] = await prisma.$transaction([
    prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.client.count(),
  ]);

  return {
    data: clients,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function getClientById(id) {
  validateId(id);
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new HttpError(404, 'Cliente não encontrado.');
  return client;
}

async function updateClient(id, input, { partial = true } = {}) {
  validateId(id);
  const data = validateFields(input, { partial });
  try {
    return await prisma.client.update({ where: { id }, data });
  } catch (error) {
    handlePrismaError(error);
  }
}

async function deleteClient(id) {
  validateId(id);
  try {
    await prisma.client.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
}

module.exports = { createClient, listClients, getClientById, updateClient, deleteClient };
