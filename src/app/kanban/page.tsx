'use client';
import { signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { DragDropContext, Draggable, DropResult, Droppable, ResponderProvided } from 'react-beautiful-dnd';
import NavBar from '../components/NavBar';
import { useState } from 'react';
import { Board } from './kanbanData';
import { Columns } from './typetasks';
import { AddOutline } from "react-ionicons";
import Task from './Task';
import AddModal from './AddModal';
import { onDragEnd } from './OnDragEnd';

export default function Kanban() {
  const [columns, setColumns] = useState<Columns>(Board);
  const [modalOpen, setModalOpen] = useState(false);
	const [selectedColumn, setSelectedColumn] = useState("");

	const openModal = (columnId: any) => {
		setSelectedColumn(columnId);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	const handleAddTask = (taskData: any) => {
		const newBoard = { ...columns };
		newBoard[selectedColumn].items.push(taskData);
	};

  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  function handleDragEnd(result: DropResult, provided: ResponderProvided): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="flex h-screen">
      <NavBar userEmail={session?.data?.user?.email} />
      <div className="flex-grow bg-gray-100 p-8">
          <DragDropContext onDragEnd={(result: any) => onDragEnd(result, columns, setColumns)}>
          <div className="w-full flex items-start justify-between px-5 pb-8 md:gap-0 gap-10">
            {Object.entries(columns).map(([columnId, column]: any) => (
              <div className="w-full flex flex-col gap-0" key={columnId}>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col md:w-[290px] w-[250px] gap-3 items-center py-5"
                    >
                      <div className="flex items-center justify-center py-[10px] w-full bg-white rounded-lg shadow-sm text-[#555] font-medium text-[15px]">
                        {column.name}
                      </div>
                      {column.items.map((task: any, index: any) => (
                        <Draggable
                          key={task.id.toString()}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided: any) => (
													<>
														<Task provided={provided} task={task}
														/>
													</>
												)}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <div
								onClick={() => openModal(columnId)}
								className="flex cursor-pointer items-center justify-center gap-1 py-[10px] md:w-[90%] w-full opacity-90 bg-white rounded-lg shadow-sm text-[#555] font-medium text-[15px]"
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

Kanban.requireAuth = true