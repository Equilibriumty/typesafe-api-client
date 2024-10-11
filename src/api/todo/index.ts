import { z } from "zod";

export const Todo = z.object({
  userId: z.number(),
  id: z.number().nonnegative(),
  title: z.string().min(1),
  completed: z.boolean(),
});

export type Todo = z.infer<typeof Todo>;

export const getTodosResponse = z.array(Todo);

export const getTodoResponse = Todo;

export const getTodos = {
  method: z.literal("GET"),
  path: z.literal("/todos"),
  parameters: z.object({
    query: z.object({
      _page: z.number().nonnegative(),
    }),
  }),
  response: getTodosResponse,
};

export const getTodo = {
  method: z.literal("GET"),
  path: z.literal("/todos"),
  parameters: z.object({
    path: z.object({
      todoId: z.number(),
    }),
  }),
  response: getTodoResponse,
};

export const createTodoResponse = z.object({
  newTodo: Todo,
});

export const createTodo = {
  method: z.literal("POST"),
  path: z.literal("/todos"),
  parameters: z.object({
    body: z.object({
      title: z.string().min(1),
      userId: z.number(),
    }),
  }),
  response: createTodoResponse,
};

export const updateTodoResponse = Todo;

export const partiallyUpdateTodo = {
  method: z.literal("PATCH"),
  path: z.literal("/todos/{todoId}"),
  parameters: z.object({
    body: z.object({
      title: z.string().optional(),
      completed: z.boolean().optional(),
    }),
    path: z.object({
      todoId: z.number(),
    }),
  }),
  response: updateTodoResponse,
};

export const deleteTodoResponse = z.object({ success: z.boolean() });

export const deleteTodo = {
  method: z.literal("DELETE"),
  path: z.literal("/todos/{todoId}"),
  parameters: z.object({
    path: z.object({
      todoId: z.number(),
    }),
  }),
  response: deleteTodoResponse,
};

export const updateTodo = {
  method: z.literal("PUT"),
  path: z.literal("/todos/{todoId}"),
  parameters: z.object({
    path: z.object({
      todoId: z.number(),
    }),
    body: z.object({
      title: z.string(),
      userId: z.number(),
      completed: z.boolean(),
    }),
  }),
  response: updateTodoResponse,
};
