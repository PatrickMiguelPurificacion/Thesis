import { IoToday } from 'react-icons/io5';
import { Task } from '../services/TaskService';
import { FaEdit, FaTrash } from 'react-icons/fa'; 

interface TaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: () => void; 
}

const TaskCard = ({ task, onEdit, onDelete }: TaskProps) => {
  const { id, title, description, priority, deadline, tags } = task;

  const handleEditClick = () => {
    onEdit(task);
  };

  const handleDeleteClick = () => {
    onDelete(); // Call onDelete function from props
  };

  return (
    <div className="w-full bg-gray-100 flex flex-col justify-between items-start shadow-sm rounded-xl p-3 relative">
      <div className="flex items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag.title}
            className="px-2 py-1 text-sm font-medium rounded-md"
            style={{ backgroundColor: tag.bg, color: tag.text }}
          >
            {tag.title}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-0 mt-2">
        <span className="text-sm font-medium text-gray-700 mb-2">{title}</span>
        <span className="text-xs text-gray-500 mb-2">{description}</span>
      </div>
      <div className="border-t border-gray-300 mt-auto pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <IoToday color={'#666'} size={19} />
            <span className="text-xs text-gray-700 ml-2">{deadline}</span>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-3">
            <button
              onClick={handleEditClick}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaEdit size={20} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              <FaTrash size={20} />
            </button>
          </div>
          <div
            className={`ml-3 w-12 h-2 rounded-full  ${
              priority === 'high'
                ? 'bg-red-500'
                : priority === 'medium'
                ? 'bg-orange-500'
                : 'bg-blue-500'
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
