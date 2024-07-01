'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { IoAddOutline } from 'react-icons/io5';
import NavBar from '../components/NavBar';
import TaskModal from '../modals/TaskModal';
import TaskCard from '../components/TaskCard';
import { fetchTasks, deleteTask, Column, Task } from '../services/TaskService';

export default function KanbanBoard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const currentUser = session?.user?.email;

  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: { name: 'To Do', items: [] },
    inProgress: { name: 'In Progress', items: [] },
    done: { name: 'Done', items: [] },
  });
  const [taskModalState, setTaskModalState] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [currentColumnId, setCurrentColumnId] = useState<string | null>(null);

  const fetchColumnTasks = useCallback(async (currentUser: string | undefined, columnId: string) => {
    if (!currentUser || !columnId) {
      console.error('Invalid parameters: currentUser or columnId is undefined');
      return;
    }
  
    try {
      const tasks = await fetchTasks(currentUser, columnId);
      setColumns(prevColumns => ({
        ...prevColumns,
        [columnId]: { ...prevColumns[columnId], items: tasks as unknown as Task[] },
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error fetching tasks');
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchColumnTasks(currentUser, 'todo');
      fetchColumnTasks(currentUser, 'inProgress');
      fetchColumnTasks(currentUser, 'done');
    }
  }, [currentUser, fetchColumnTasks]);

  const handleAddTask = (columnId: string) => {
    setCurrentTask(null);
    setCurrentColumnId(columnId);
    setTaskModalState(true);
  };

  const handleEditTask = (task: Task, columnId: string) => {
    setCurrentTask(task);
    setCurrentColumnId(columnId);
    setTaskModalState(true);
  };

  const handleDeleteTask = async (taskId: string, columnId: string) => {
    const confirmation = window.confirm('Are you sure you want to delete this task?');
    if (confirmation && currentUser) {
      try {
        await deleteTask(taskId);
        await fetchColumnTasks(currentUser, columnId); // Refresh tasks after deletion
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Error deleting task');
      }
    }
  };

  const handleModalClose = () => {
    setTaskModalState(false);
    if (currentColumnId && currentUser) {
      fetchColumnTasks(currentUser, 'todo');
      fetchColumnTasks(currentUser, 'inProgress');
      fetchColumnTasks(currentUser, 'done');
    }
  };

  return (
    <div className="flex h-screen">
      <NavBar userEmail={session?.user?.email} />

      <div className="flex-grow overflow-y-auto bg-gray-100 p-8">
        <header className="text-white py-6 px-8 flex justify-between items-center"  style={{ backgroundColor: '#142059' }}>
          <h1 className="text-2xl font-semibold">Kanban Board</h1>
        </header>

        <div className="flex space-x-4 mt-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="w-1/3 bg-white rounded shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{column.name}</h2>
                <button
                  onClick={() => handleAddTask(columnId)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <IoAddOutline size={24} />
                </button>
              </div>
              <div>
                {column.items.map(task => (
                  <div key={task.id} className="mb-4">
                    <TaskCard
                      task={task}
                      onEdit={() => handleEditTask(task, columnId)}
                      onDelete={() => handleDeleteTask(task.id, columnId)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {taskModalState && (
          <TaskModal
            setModalState={handleModalClose}
            initialTask={currentTask}
            taskId={currentTask?.id || null}
            columnId={currentColumnId || ''}
          />
        )}
      </div>
    </div>
  );
}
