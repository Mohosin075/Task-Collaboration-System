import { baseApi } from './baseApi';

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProjectById: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project', 'Activity'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => ['Project', { type: 'Project', id }, 'Activity'],
    }),
    deleteProject: builder.mutation({
      query: ({ id, userName }) => ({
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
