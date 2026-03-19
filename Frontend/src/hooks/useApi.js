import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Error en la petición';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, fetchData, reset };
};

export default useApi;
