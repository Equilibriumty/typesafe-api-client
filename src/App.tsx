import { useEffect, useState } from "react";
import "./App.css";
import { Todo } from "./api/todo";
import { apiClient } from "./api/fetch";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todo, setTodo] = useState<Todo | null>(null);

  const getTodos = async () => {
    const todos = await apiClient.get("/todos", { query: { _page: 1 } });
    setTodos(todos);
  };

  const getTodo = async (todoId: number) => {
    const todo = await apiClient.get("/todos/{todoId}", {
      path: { todoId: 1 },
    });
    setTodo(todo);
  };

  const handleDeleteTodo = async (todoId: number) => {
    const deletedTodo = await apiClient.delete("/todos/{todoId}", {
      path: {
        todoId,
      },
    });
  };

  const handlePartiallyUpdateTodo = async (
    todoId: number,
    body: Partial<Omit<Todo, "id">>
  ) => {
    const updatedTodo = await apiClient.patch("/todos/{todoId}", {
      path: {
        todoId,
      },
      body: {
        title: body.title,
        completed: body.completed,
      },
    });
  };

  const handleUpdateTodo = async (todoId: number, body: Omit<Todo, "id">) => {
    const updatedTodo = await apiClient.put("/todos/{todoId}", {
      path: {
        todoId,
      },
      body: {
        title: body.title,
        userId: body.userId,
        completed: body.completed,
      },
    });
  };

  const handleCreateTodo = async (body: Omit<Todo, "id">) => {
    const createdTodo = await apiClient.post("/todos", {
      body: {
        title: "new todo",
        userId: 1,
      },
    });
  };

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <div>
      <span>Hello</span>

      <div>
        {todos.map((todo) => (
          <span key={todo.id}>{todo.title}</span>
        ))}
      </div>

      <button onClick={() => handleDeleteTodo(1)}>Test</button>
    </div>
  );
}

export default App;
