import { baseApi } from './baseApi';

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder: any) => ({
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProjectById: builder.query({
      query: (id: any) => `/projects/${id}`,
      providesTags: (result: any, error: any, id: any) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (projectData: any) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project', 'Activity'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...patch }: any) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result: any, error: any, { id }: any) => ['Project', { type: 'Project', id }, 'Activity'],
    }),
    deleteProject: builder.mutation({
      query: ({ id, userName }: any) => ({
        url: `/projects/${id}?userName=${encodeURIComponent(userName)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'Activity'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
