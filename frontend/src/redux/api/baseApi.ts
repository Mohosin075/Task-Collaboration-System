import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use env or default local backend address
const BASE_URL = 'http://localhost:5000/api/v1';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', token);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Project', 'Task', 'Comment', 'Activity'],
  endpoints: (builder: any) => ({}),
});
