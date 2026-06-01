import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder: any) => ({
    login: builder.mutation({
      query: (credentials: any) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    signup: builder.mutation({
      query: (userData: any) => ({
        url: '/users/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    seedDemo: builder.mutation({
      query: () => ({
        url: '/users/seed-demo',
        method: 'POST',
      }),
    }),
    getTeamMembers: builder.query({
      query: () => '/users/team',
      providesTags: ['User'],
    }),
    getWorkload: builder.query({
      query: () => '/users/workload',
      providesTags: ['Task'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useSeedDemoMutation,
  useGetTeamMembersQuery,
  useGetWorkloadQuery,
} = authApi;
