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
