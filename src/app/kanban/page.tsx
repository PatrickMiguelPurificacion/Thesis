'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import { toast } from 'sonner';
import { IoAddOutline } from 'react-icons/io5';

import TaskModal from '../modals/TaskModal';
import { fetchTasks, deleteTask, Column, Task } from '../services/TaskService';
import NavBar from '../components/NavBar';
import TaskCard from '../components/TaskCard';

export default function KanbanBoard() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const currentUser = session?.data?.user?.email;

  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: { name: 'To Do', items: [] },
    inProgress: { name: 'In Progress', items: [] },
    done: { name: 'Done', items: [] },
  });
  const [taskModalState, setTaskModalState] = useState(false);
  const [currentTask, setCurrentTask] = useState<any | null>(null);
  const [currentColumnId, setCurrentColumnId] = useState<string | null>(null);

  const fetchColumnTasks = useCallback(async (currentUser: string | undefined, columnId: string) => {
    if (!currentUser || !columnId) {
      console.error('Invalid parameters: currentUser or columnId is undefined');
      return;
    }
  
    try {
      const tasks = await fetchTasks(currentUser , columnId);
      setColumns((prevColumns: Record<string, Column>) => ({
        ...prevColumns,
        [columnId]: { ...prevColumns[columnId], items: tasks as unknown as Task[] }, // Assert tasks as Task[]
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
  }, [fetchColumnTasks, currentUser]);

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
        fetchColumnTasks(currentUser, columnId);
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Error deleting task');
      }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    });
  };

  const handleModalClose = () => {
    setTaskModalState(false);
    if (currentColumnId && currentUser) {
      fetchColumnTasks(currentUser, currentColumnId); // Refresh tasks after closing the modal
    }
  };

  return (
    <div className="flex h-screen">
        <NavBar userEmail={session?.data?.user?.email} /> {/* Calls the NavBar component */}
      <div className="flex-grow overflow-y-auto bg-gray-100 p-8">
        
        <header className="bg-indigo-600 text-white py-6 px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Kanban Board</h1>
        </header>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 mt-4">
            {Object.entries(columns).map(([columnId, column]) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="w-1/3 bg-white rounded shadow p-4"
                  >
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
                    {column.items.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div className="mb-4">
                          <TaskCard task={task} provided={provided} onEdit={(task) => handleEditTask(task, columnId)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

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
};
