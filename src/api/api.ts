import z from 'zod';
import {
  getTodo,
  getTodos,
  createTodo,
  partiallyUpdateTodo,
  deleteTodo,
  updateTodo,
} from './todo';

export type NewFeedback = z.infer<typeof NewFeedback>;
export const NewFeedback = z.object({
  commenter: z.string(),
  stars: z.union([z.number(), z.undefined()]).optional(),
  comment: z.string(),
});

export const EndpointByMethod = {
  get: {
    '/todos': getTodos,
    '/todos/{todoId}': getTodo,
  },
  post: {
    '/todos': createTodo,
  },
  patch: {
    '/todos/{todoId}': partiallyUpdateTodo,
  },
  delete: {
    '/todos/{todoId}': deleteTodo,
  },
  put: {
    '/todos/{todoId}': updateTodo,
  },
};

export type EndpointByMethod = typeof EndpointByMethod;

export type GetEndpoints = EndpointByMethod['get'];
export type PostEndpoints = EndpointByMethod['post'];
export type PatchEndpoints = EndpointByMethod['patch'];
export type DeleteEndpoints = EndpointByMethod['delete'];
export type PutEndpoints = EndpointByMethod['put'];

export type EndpointParameters = {
  body?: unknown;
  query?: Record<string, unknown>;
  header?: Record<string, unknown>;
  path?: Record<string, unknown>;
};
