import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateTask, createTask, Tag } from '../services/TaskService';
import { v4 as uuidv4 } from "uuid";
import { getRandomColors } from '../kanban/GetRandomColorsKanban';

interface Props {
  setModalState: (state: boolean) => void;
  initialTask?: any;
  taskId?: string | null;
  columnId: string;
}

const TaskModal = ({ setModalState, initialTask, taskId, columnId }: Props) => {
  const { data: session } = useSession();
  const [tagTitle, setTagTitle] = useState("");
  const [task, setTask] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'low',
    deadline: '',
    columnId,
    userId: session?.user?.email || '',
    tags: [] as Tag[],
  });

  useEffect(() => {
    if (initialTask) {
      setTask({
        ...initialTask,
        userId: session?.user?.email || '',
        id: uuidv4()
      });
    }
  }, [initialTask, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleAddTag = () => {
		if (tagTitle.trim() !== "") {
			const { bg, text } = getRandomColors();
			const newTag: Tag = { title: tagTitle.trim(), bg, text };
			setTask({ ...task, tags: [...task.tags, newTag] });
			setTagTitle("");
		}
	};

  const saveTask = async () => {
    try {
      if (taskId) {
        await updateTask(taskId, task);
        toast.success('Task Updated Successfully!');
      } else {
        await createTask(task);
        toast.success('Task Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Task');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="md:w-[60vw] bg-white rounded-lg shadow-md z-50 p-6 flex">
        {/* Left Column */}
        <div className="flex-1 pr-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Task Title
            </label>
            <input
              className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm font-medium"
              id="title"
              type="text"
              name="title"
              value={task.title}
              onChange={handleInputChange}
              placeholder="Task Title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Task Description
            </label>
            <textarea
              className="w-full h-24 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm font-medium"
              id="description"
              name="description"
              value={task.description}
              onChange={handleTextareaChange}
              placeholder="Task Description"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
              Task Priority
            </label>
            <select
              className="w-full h-12 px-2 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
              id="priority"
              name="priority"
              value={task.priority}
              onChange={handleDropdownChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="flex-1 pl-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
              Task Deadline
            </label>
            <input
              className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
              id="deadline"
              type="date"
              name="deadline"
              value={task.deadline}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tagTitle">
              Add Tag
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={tagTitle}
                onChange={(e) => setTagTitle(e.target.value)}
                placeholder="Tag Title"
                className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
              />
              <button
                className="ml-2 px-3 py-2 rounded-md bg-slate-500 text-amber-50 font-medium"
                onClick={handleAddTag}
              >
                Add
              </button>
            </div>
          </div>
          <div>
            {task.tags && <span className="block text-gray-700 text-sm font-bold mb-2">Tags:</span>}
            <div className="mt-2 flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <div
                  key={index}
                  className="inline-block px-3 py-1 text-sm font-medium rounded-md"
                  style={{ backgroundColor: tag.bg, color: tag.text }}
                >
                  {tag.title}
                </div>
              ))}
            </div>
          </div>
        
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveTask}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-2 rounded focus:outline-none focus:shadow-outline"
            >
              {taskId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => setModalState(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 ml-2 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      </div>
  );
};

export default TaskModal;
