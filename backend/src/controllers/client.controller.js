const clientService = require('../services/client.service');

async function create(req, res) {
  const client = await clientService.createClient(req.body);
  res.status(201).json({ data: client });
}

async function list(req, res) {
  const result = await clientService.listClients(req.query);
  res.status(200).json(result);
}

async function getById(req, res) {
  const client = await clientService.getClientById(req.params.id);
  res.status(200).json({ data: client });
}

async function update(req, res) {
  const client = await clientService.updateClient(req.params.id, req.body, {
    partial: req.method !== 'PUT',
  });
  res.status(200).json({ data: client });
}

async function remove(req, res) {
  await clientService.deleteClient(req.params.id);
  res.status(204).send();
}

module.exports = { create, list, getById, update, remove };
