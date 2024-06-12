'use client';
import { signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import NavBar from '../components/NavBar';
import { useState } from 'react';
import { Board } from './kanbanData';
import { Columns } from './typetasks';
import { AddOutline } from "react-ionicons";
import Task from './Task';
import AddModal from './AddModal';

export default function Kanban() {
  const [columns, setColumns] = useState<Columns>(Board);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");

  const openModal = (columnId: string) => {
    setSelectedColumn(columnId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleAddTask = (taskData: any) => {
    const newBoard = { ...columns };
    newBoard[selectedColumn].items.push(taskData);
    setColumns(newBoard);
    closeModal();
  };

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = columns[source.droppableId];
    const destinationColumn = columns[destination.droppableId];
    const [movedTask] = sourceColumn.items.splice(source.index, 1);
    destinationColumn.items.splice(destination.index, 0, movedTask);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destinationColumn,
    });
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <NavBar userEmail={session?.user?.email} />
      <div className="flex-grow bg-gray-100 p-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="w-full flex items-start justify-between px-5 pb-8 gap-10">
            {Object.entries(columns).map(([columnId, column]) => (
              <div className="flex flex-col flex-grow gap-4" key={columnId}>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col gap-3 items-center py-5 bg-white rounded-lg shadow-sm flex-grow"
                    >
                      <div className="flex items-center justify-center py-[10px] w-full bg-blue-500 rounded-t-lg shadow-sm text-white font-medium text-[15px]">
                        {column.name}
                      </div>
                      {column.items.map((task, index) => (
                        <Draggable
                          key={task.id.toString()}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <Task task={task} provided={provided} />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <div
                  onClick={() => openModal(columnId)}
                  className="flex cursor-pointer items-center justify-center gap-1 py-[10px] w-full opacity-90 bg-white rounded-lg shadow-sm text-[#555] font-medium text-[15px]"
                >
                  <AddOutline color={"#555"} />
                  Add Task
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
        <AddModal
          isOpen={modalOpen}
          onClose={closeModal}
          setOpen={setModalOpen}
          handleAddTask={handleAddTask}
        />
      </div>
    </div>
  );
}

Kanban.requireAuth = true;