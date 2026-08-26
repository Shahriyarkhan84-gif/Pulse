import axios from "axios";
import { config } from "@/constants/config";
import { getAccessToken } from "@/services/storage/secureStorage";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
});

apiClient.interceptors.request.use(async (requestConfig) => {
  const token = await getAccessToken();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});
