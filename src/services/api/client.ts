import axios from "axios";
import { config } from "@/constants/config";
import { supabase } from "@/services/supabase/client";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
});

apiClient.interceptors.request.use(async (requestConfig) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});
