import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const trainModels = async (params) => {
  const response = await api.post('/train', params);
  return response.data;
};

export const getPredictionHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const getExperiments = async () => {
  const response = await api.get('/experiments');
  return response.data;
};

export const getRuns = async () => {
  const response = await api.get('/runs');
  return response.data;
};

export const getBestModel = async () => {
  const response = await api.get('/best-model');
  return response.data;
};

export const predictVehicle = async (features) => {
  const response = await api.post('/predict', features);
  return response.data;
};

export const loadDataset = async () => {
  try {
    const response = await api.get('/load-dataset');
    return response.data;
  } catch (error) {
    console.error("API load-dataset error:", error);
    throw error.response?.data || { detail: "Erreur lors du chargement du dataset." };
  }
};

export default api;
