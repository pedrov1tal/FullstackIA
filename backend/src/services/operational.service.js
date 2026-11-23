const prisma = require('../lib/prisma');
const HttpError = require('../utils/http-error');

const statuses = ['RECEIVED', 'IN_DIAGNOSIS', 'WAITING_APPROVAL', 'WAITING_PARTS', 'IN_REPAIR', 'COMPLETED', 'DELIVERED', 'CANCELLED'];
const methods = ['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'OTHER'];
const orderInclude = {
  device: { include: { client: true } },
  parts: { include: { part: true } }, services: { include: { service: true } },
  payments: true, history: { orderBy: { createdAt: 'desc' } }, technician: { select: { id: true, name: true } },
};
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function id(value, label = 'ID') { if (!idPattern.test(value || '')) throw new HttpError(400, `${label} inválido.`); }
function text(value, label, max = 10000, required = false) { if (value == null && !required) return null; if (typeof value !== 'string' || (required && !value.trim()) || value.trim().length > max) throw new HttpError(400, `${label} é inválido.`); return value.trim() || null; }
function money(value, label, required = true) { const n = Number(value); if ((required && (value === '' || value == null)) || !Number.isFinite(n) || n < 0) throw new HttpError(400, `${label} deve ser um valor positivo.`); return n; }
function positiveInt(value, label) { const n = Number(value); if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${label} deve ser um inteiro maior que zero.`); return n; }
function prismaError(error) { if (error.code === 'P2002') throw new HttpError(409, 'Já existe um registro com esses dados.'); if (error.code === 'P2003') throw new HttpError(409, 'Não é possível excluir este registro porque há vínculos.'); if (error.code === 'P2025') throw new HttpError(404, 'Registro não encontrado.'); throw error; }
function total(order) { return Number(order.laborAmount || 0) + order.parts.reduce((sum, p) => sum + Number(p.unitPrice) * p.quantity, 0) + order.services.reduce((sum, s) => sum + Number(s.unitPrice), 0); }
function serializeOrder(order) { return { ...order, totalAmount: total(order) }; }

async function listDevices(clientId) { if (clientId) id(clientId, 'ID do cliente'); return prisma.device.findMany({ where: clientId ? { clientId } : undefined, include: { client: true }, orderBy: { createdAt: 'desc' } }); }
async function createDevice(input) { id(input.clientId, 'ID do cliente'); const data = { clientId: input.clientId, brand: text(input.brand, 'Marca', 80, true), model: text(input.model, 'Modelo', 120, true), imei: text(input.imei, 'IMEI', 20), color: text(input.color, 'Cor', 50) }; try { return await prisma.device.create({ data, include: { client: true } }); } catch (e) { prismaError(e); } }

async function listOrders(query) {
  const where = {};
  if (query.status) { if (!statuses.includes(query.status)) throw new HttpError(400, 'Status inválido.'); where.status = query.status; }
  if (query.number) { const n = Number(query.number); if (!Number.isInteger(n)) throw new HttpError(400, 'Número da ordem inválido.'); where.orderNumber = n; }
  if (query.client) where.device = { client: { name: { contains: String(query.client), mode: 'insensitive' } } };
  return (await prisma.serviceOrder.findMany({ where, include: orderInclude, orderBy: { createdAt: 'desc' } })).map(serializeOrder);
}
async function getOrder(orderId) { id(orderId, 'ID da ordem'); const order = await prisma.serviceOrder.findUnique({ where: { id: orderId }, include: orderInclude }); if (!order) throw new HttpError(404, 'Ordem de serviço não encontrada.'); return serializeOrder(order); }
async function defaultUser(tx) { const user = await tx.user.findFirst({ where: { active: true }, orderBy: { createdAt: 'asc' } }); if (!user) throw new HttpError(409, 'Não há usuário ativo para registrar a ordem.'); return user.id; }
async function createOrder(input) {
  id(input.deviceId, 'ID do aparelho'); const reportedIssue = text(input.reportedIssue, 'Problema relatado', 10000, true);
  const laborAmount = money(input.laborAmount ?? 0, 'Mão de obra');
  return prisma.$transaction(async (tx) => {
    const device = await tx.device.findUnique({ where: { id: input.deviceId } }); if (!device) throw new HttpError(404, 'Aparelho não encontrado.');
    const creator = await defaultUser(tx);
    const order = await tx.serviceOrder.create({ data: { deviceId: input.deviceId, createdById: creator, reportedIssue, diagnosis: text(input.diagnosis, 'Diagnóstico'), repairNotes: text(input.repairNotes, 'Serviço realizado'), laborAmount }, });
    await tx.serviceOrderHistory.create({ data: { serviceOrderId: order.id, newStatus: 'RECEIVED', note: 'Ordem cadastrada.' } });
    return getOrderTx(tx, order.id);
  });
}
async function getOrderTx(tx, orderId) { const order = await tx.serviceOrder.findUnique({ where: { id: orderId }, include: orderInclude }); return serializeOrder(order); }
async function updateOrder(orderId, input) {
  id(orderId, 'ID da ordem'); const data = {};
  if ('reportedIssue' in input) data.reportedIssue = text(input.reportedIssue, 'Problema relatado', 10000, true);
  if ('diagnosis' in input) data.diagnosis = text(input.diagnosis, 'Diagnóstico');
  if ('repairNotes' in input) data.repairNotes = text(input.repairNotes, 'Serviço realizado');
  if ('laborAmount' in input) data.laborAmount = money(input.laborAmount, 'Mão de obra');
  if (!Object.keys(data).length) throw new HttpError(400, 'Informe ao menos um campo para atualizar.');
  try { await prisma.serviceOrder.update({ where: { id: orderId }, data }); return getOrder(orderId); } catch (e) { prismaError(e); }
}
async function setOrderStatus(orderId, input) {
  id(orderId, 'ID da ordem'); if (!statuses.includes(input.status)) throw new HttpError(400, 'Status inválido.');
  return prisma.$transaction(async (tx) => { const current = await tx.serviceOrder.findUnique({ where: { id: orderId } }); if (!current) throw new HttpError(404, 'Ordem de serviço não encontrada.'); const data = { status: input.status }; if (input.status === 'COMPLETED') data.completedAt = new Date(); if (input.status === 'DELIVERED') data.deliveredAt = new Date(); await tx.serviceOrder.update({ where: { id: orderId }, data }); await tx.serviceOrderHistory.create({ data: { serviceOrderId: orderId, previousStatus: current.status, newStatus: input.status, note: text(input.note, 'Observação') } }); return getOrderTx(tx, orderId); });
}
async function deleteOrder(orderId) {
  id(orderId, 'ID da ordem');
  return prisma.$transaction(async tx => {
    const order = await tx.serviceOrder.findUnique({ where: { id: orderId }, include: { parts: true } });
    if (!order) throw new HttpError(404, 'Ordem de serviço não encontrada.');
    for (const item of order.parts) await tx.part.update({ where: { id: item.partId }, data: { stock: { increment: item.quantity } } });
    await tx.stockMovement.deleteMany({ where: { serviceOrderId: orderId } });
    await tx.orderPart.deleteMany({ where: { serviceOrderId: orderId } });
    await tx.orderService.deleteMany({ where: { serviceOrderId: orderId } });
    await tx.payment.deleteMany({ where: { serviceOrderId: orderId } });
    await tx.serviceOrder.delete({ where: { id: orderId } });
  });
}
async function addOrderPart(orderId, input) {
  id(orderId, 'ID da ordem'); id(input.partId, 'ID da peça'); const quantity = positiveInt(input.quantity, 'Quantidade'); const unitPrice = money(input.unitPrice, 'Valor unitário');
  return prisma.$transaction(async (tx) => { const part = await tx.part.findUnique({ where: { id: input.partId } }); if (!part) throw new HttpError(404, 'Peça não encontrada.'); if (part.stock < quantity) throw new HttpError(409, `Estoque insuficiente para ${part.name}.`); await tx.serviceOrder.findUniqueOrThrow({ where: { id: orderId } }); const current = await tx.orderPart.findUnique({ where: { serviceOrderId_partId: { serviceOrderId: orderId, partId: input.partId } } }); await tx.part.update({ where: { id: part.id }, data: { stock: { decrement: quantity } } }); await tx.orderPart.upsert({ where: { serviceOrderId_partId: { serviceOrderId: orderId, partId: input.partId } }, create: { serviceOrderId: orderId, partId: input.partId, quantity, unitPrice }, update: { quantity: { increment: quantity }, unitPrice } }); await tx.stockMovement.create({ data: { partId: part.id, serviceOrderId: orderId, type: 'EXIT', quantity, note: `Utilizada na OS #${(await tx.serviceOrder.findUnique({ where: { id: orderId }, select: { orderNumber: true } })).orderNumber}` } }); return getOrderTx(tx, orderId); });
}
async function addOrderService(orderId, input) { id(orderId, 'ID da ordem'); id(input.serviceId, 'ID do serviço'); return prisma.$transaction(async tx => { const service = await tx.service.findUnique({ where: { id: input.serviceId } }); if (!service) throw new HttpError(404, 'Serviço não encontrado.'); await tx.orderService.upsert({ where: { serviceOrderId_serviceId: { serviceOrderId: orderId, serviceId: input.serviceId } }, create: { serviceOrderId: orderId, serviceId: input.serviceId, unitPrice: money(input.unitPrice ?? service.suggestedPrice, 'Valor do serviço') }, update: { unitPrice: money(input.unitPrice ?? service.suggestedPrice, 'Valor do serviço') } }); return getOrderTx(tx, orderId); }); }

async function listParts(query) { const search = String(query.search || '').trim(); return prisma.part.findMany({ where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }] } : undefined, orderBy: { name: 'asc' } }); }
function partData(input, partial = false) { const data = {}; if (!partial || 'sku' in input) data.sku = text(input.sku, 'SKU', 60, true); if (!partial || 'name' in input) data.name = text(input.name, 'Nome', 150, true); if ('description' in input) data.description = text(input.description, 'Descrição'); if (!partial || 'unitCost' in input) data.unitCost = money(input.unitCost, 'Valor unitário'); if ('minimumStock' in input) data.minimumStock = Math.max(0, Number(input.minimumStock)); if (!partial || 'stock' in input) data.stock = Math.max(0, Number(input.stock ?? 0)); if (!Object.keys(data).length) throw new HttpError(400, 'Informe dados para a peça.'); return data; }
async function createPart(input) { try { return await prisma.part.create({ data: partData(input) }); } catch (e) { prismaError(e); } }
async function updatePart(partId, input) { id(partId, 'ID da peça'); try { return await prisma.part.update({ where: { id: partId }, data: partData(input, true) }); } catch (e) { prismaError(e); } }
async function deletePart(partId) { id(partId, 'ID da peça'); try { await prisma.$transaction(async tx => { await tx.part.findUniqueOrThrow({ where: { id: partId } }); await tx.stockMovement.deleteMany({ where: { partId } }); await tx.orderPart.deleteMany({ where: { partId } }); await tx.part.delete({ where: { id: partId } }); }); } catch (e) { prismaError(e); } }
async function moveStock(partId, input) { id(partId, 'ID da peça'); if (!['ENTRY', 'EXIT', 'ADJUSTMENT'].includes(input.type)) throw new HttpError(400, 'Tipo de movimentação inválido.'); const quantity = positiveInt(input.quantity, 'Quantidade'); return prisma.$transaction(async tx => { const part = await tx.part.findUnique({ where: { id: partId } }); if (!part) throw new HttpError(404, 'Peça não encontrada.'); const delta = input.type === 'EXIT' ? -quantity : quantity; if (part.stock + delta < 0) throw new HttpError(409, 'A movimentação deixaria o estoque negativo.'); const updated = await tx.part.update({ where: { id: partId }, data: { stock: { increment: delta } } }); await tx.stockMovement.create({ data: { partId, type: input.type, quantity, note: text(input.note, 'Observação', 255) } }); return updated; }); }

async function listServices() { return prisma.service.findMany({ include: { _count: { select: { orderServices: true } } }, orderBy: { name: 'asc' } }); }
async function saveService(serviceId, input) { const data = { name: text(input.name, 'Nome', 150, true), description: text(input.description, 'Descrição'), suggestedPrice: money(input.suggestedPrice, 'Preço sugerido') }; try { return serviceId ? await prisma.service.update({ where: { id: serviceId }, data }) : await prisma.service.create({ data }); } catch (e) { prismaError(e); } }
async function deleteService(serviceId) { id(serviceId, 'ID do serviço'); try { await prisma.$transaction(async tx => { await tx.service.findUniqueOrThrow({ where: { id: serviceId } }); await tx.orderService.deleteMany({ where: { serviceId } }); await tx.service.delete({ where: { id: serviceId } }); }); } catch (e) { prismaError(e); } }
async function listPayments(query) { return prisma.payment.findMany({ where: query.pending === 'true' ? { status: 'PENDING' } : undefined, include: { serviceOrder: { include: { device: { include: { client: true } } } } }, orderBy: { createdAt: 'desc' } }); }
async function createPayment(input) { id(input.serviceOrderId, 'ID da ordem'); if (!methods.includes(input.method)) throw new HttpError(400, 'Forma de pagamento inválida.'); const amount = money(input.amount, 'Valor'); const reference = text(input.reference, 'Referência', 120); return prisma.$transaction(async tx => { const order = await getOrderTx(tx, input.serviceOrderId); if (reference) { const duplicate = await tx.payment.findFirst({ where: { serviceOrderId: input.serviceOrderId, reference, status: 'PAID' } }); if (duplicate) throw new HttpError(409, 'Já existe um pagamento recebido com esta referência.'); } if (amount > order.totalAmount) throw new HttpError(409, 'O pagamento não pode superar o valor total da ordem.'); return tx.payment.create({ data: { serviceOrderId: input.serviceOrderId, amount, method: input.method, status: 'PAID', paidAt: new Date(), reference } }); }); }
async function deletePayment(paymentId) { id(paymentId, 'ID do pagamento'); try { await prisma.payment.delete({ where: { id: paymentId } }); } catch (e) { prismaError(e); } }
async function dashboard() { const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); const [clients, byStatus, payments, recent] = await Promise.all([prisma.client.count(), prisma.serviceOrder.groupBy({ by: ['status'], _count: true }), prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', paidAt: { gte: start } } }), prisma.serviceOrder.findMany({ take: 6, include: orderInclude, orderBy: { updatedAt: 'desc' } })]); const count = s => byStatus.filter(x => s.includes(x.status)).reduce((a, x) => a + x._count, 0); return { clients, openOrders: count(['RECEIVED', 'IN_DIAGNOSIS', 'WAITING_APPROVAL', 'WAITING_PARTS']), inProgressOrders: count(['IN_REPAIR']), completedOrders: count(['COMPLETED', 'DELIVERED']), monthlyRevenue: Number(payments._sum.amount || 0), recentOrders: recent.map(serializeOrder) }; }
async function profile() { const user = await prisma.user.findFirst({ where: { active: true }, orderBy: { createdAt: 'asc' }, select: { id: true, name: true, email: true, role: true } }); if (!user) throw new HttpError(404, 'Usuário não encontrado.'); return user; }
async function updateProfile(input) { const user = await profile(); return prisma.user.update({ where: { id: user.id }, data: { name: text(input.name, 'Nome', 120, true), email: text(input.email, 'Email', 255, true).toLowerCase() }, select: { id: true, name: true, email: true, role: true } }); }
module.exports = { listDevices, createDevice, listOrders, getOrder, createOrder, updateOrder, deleteOrder, setOrderStatus, addOrderPart, addOrderService, listParts, createPart, updatePart, deletePart, moveStock, listServices, saveService, deleteService, listPayments, createPayment, deletePayment, dashboard, profile, updateProfile };
