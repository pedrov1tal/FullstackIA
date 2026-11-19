const express = require('express');
const clientController = require('../controllers/client.controller');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

router.post('/', asyncHandler(clientController.create));
router.get('/', asyncHandler(clientController.list));
router.get('/:id', asyncHandler(clientController.getById));
router.put('/:id', asyncHandler(clientController.update));
router.patch('/:id', asyncHandler(clientController.update));
router.delete('/:id', asyncHandler(clientController.remove));

module.exports = router;
