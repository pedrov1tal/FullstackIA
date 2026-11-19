import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export function getApiErrorMessage(error) {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === 'ECONNABORTED') return 'A API demorou para responder. Tente novamente.';
  if (!error.response) return 'Não foi possível conectar à API. Verifique se o servidor está ativo.';
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export const clientsApi = {
  async list() {
    const pageSize = 100;
    const { data: firstPage } = await api.get('/clients', { params: { page: 1, limit: pageSize } });
    if (Array.isArray(firstPage)) return firstPage;
    const clients = firstPage.data || [];
    const totalPages = firstPage.pagination?.totalPages || 1;
    if (totalPages < 2) return clients;

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        api.get('/clients', { params: { page: index + 2, limit: pageSize } }),
      ),
    );
    return clients.concat(...remainingPages.map(({ data }) => data.data || []));
  },
  async create(client) {
    const { data } = await api.post('/clients', client);
    return data.data;
  },
  async update(id, client) {
    const { data } = await api.patch(`/clients/${id}`, client);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/clients/${id}`);
  },
};

const unwrap = (request) => request.then(({ data }) => data.data);
export const operationalApi = {
  dashboard: () => unwrap(api.get('/dashboard')),
  devices: (clientId) => unwrap(api.get('/devices', { params: clientId ? { clientId } : {} })), createDevice: (data) => unwrap(api.post('/devices', data)),
  orders: (params) => unwrap(api.get('/orders', { params })), order: (id) => unwrap(api.get(`/orders/${id}`)), createOrder: (data) => unwrap(api.post('/orders', data)), updateOrder: (id, data) => unwrap(api.patch(`/orders/${id}`, data)), setStatus: (id, data) => unwrap(api.post(`/orders/${id}/status`, data)), addPart: (id, data) => unwrap(api.post(`/orders/${id}/parts`, data)), addService: (id, data) => unwrap(api.post(`/orders/${id}/services`, data)),
  parts: (search) => unwrap(api.get('/parts', { params: { search } })), createPart: (data) => unwrap(api.post('/parts', data)), updatePart: (id, data) => unwrap(api.patch(`/parts/${id}`, data)), removePart: (id) => api.delete(`/parts/${id}`), movePart: (id, data) => unwrap(api.post(`/parts/${id}/movements`, data)),
  services: () => unwrap(api.get('/services')), createService: (data) => unwrap(api.post('/services', data)), updateService: (id, data) => unwrap(api.patch(`/services/${id}`, data)), removeService: (id) => api.delete(`/services/${id}`),
  payments: (pending) => unwrap(api.get('/payments', { params: pending ? { pending: 'true' } : {} })), createPayment: (data) => unwrap(api.post('/payments', data)),
  profile: () => unwrap(api.get('/profile')), updateProfile: (data) => unwrap(api.patch('/profile', data)),
};
