import { baseApi } from './baseApi';

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (params) => ({
        url: '/tasks',
        method: 'GET',
        params,
      }),
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),
    deleteTask: builder.mutation({
      query: ({ id, userName }) => ({
        url: `/tasks/${id}?userName=${encodeURIComponent(userName)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),
    getComments: builder.query({
      query: (taskId) => `/comments/${taskId}`,
      providesTags: ['Comment'],
    }),
    addComment: builder.mutation({
      query: (commentData) => ({
        url: '/comments',
        method: 'POST',
        body: commentData,
      }),
      invalidatesTags: ['Comment', 'Activity'],
    }),
    getActivities: builder.query({
      query: () => '/activities/recent',
      providesTags: ['Activity'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useGetActivitiesQuery,
} = taskApi;
