import { IoTimeOutline } from "react-icons/io5";
import { Task } from "../services/TaskService";
import { FaEdit } from 'react-icons/fa';

interface TaskProps {
  task: Task;
  provided: any;
  onEdit: (task: Task) => void;
}

const TaskCard = ({ task, provided, onEdit }: TaskProps) => {
  const { id, title, description, priority, deadline, tags } = task;

  const handleEditClick = () => {
    onEdit(task);
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="w-full cursor-grab bg-gray-100 flex flex-col justify-between gap-3 items-start shadow-sm rounded-xl px-3 py-4 relative"
    >
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
      <div className="w-full flex items-start flex-col gap-0">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <div className="w-full border border-dashed"></div>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1">
          <IoTimeOutline color={"#666"} width="19px" height="19px" />
          <span className="text-xs text-gray-700">{deadline} mins</span>
        </div>
        <div
          className={`absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700`}
          onClick={handleEditClick}
        >
          <FaEdit size={20} />
        </div>
        <div
          className={`w-12 h-2 rounded-full ${
            priority === "high"
              ? "bg-red-500"
              : priority === "medium"
              ? "bg-orange-500"
              : "bg-blue-500"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default TaskCard;
