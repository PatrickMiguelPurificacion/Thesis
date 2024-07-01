import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { addNotebook, updateNotebook } from '../services/NotebookService';

interface Props {
  setModalState: (state: boolean) => void;
  initialNotebook?: { notebookName: string; notesNum: number; userID: string };
  notebookID?: string | null;
}

const NotebookModal = ({ setModalState, initialNotebook, notebookID }: Props) => {
  const { data: session } = useSession();
  const [notebook, setNotebook] = useState({
    notebookName: initialNotebook?.notebookName || '',
    notesNum: initialNotebook?.notesNum || 0,
    userID: session?.user?.email || '',
  });

  useEffect(() => {
    if (initialNotebook) {
      setNotebook({
        notebookName: initialNotebook.notebookName || '',
        notesNum: initialNotebook.notesNum || 0,
        userID: session?.user?.email || '',
      });
    }
  }, [initialNotebook, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotebook({ ...notebook, [name]: value });
  };

  const saveNotebook = async () => {
    if (!notebook.notebookName) {
      toast.error('Add a Notebook Name');
      return;
    }

    try {
      if (notebookID) {
        // Update existing notebook
        await updateNotebook(notebookID, notebook);
        toast.success('Notebook Updated Successfully!');
      } else {
        // Create new notebook
        await addNotebook(notebook);
        toast.success('Notebook Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Notebook');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Notebook Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="notebookName"
            type="text"
            name="notebookName"
            value={notebook.notebookName}
            onChange={handleInputChange}
            placeholder="Name of Your Notebook"
            required
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={saveNotebook}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {notebookID ? 'Update' : 'Create'}
          </button>
          <button
            onClick={() => setModalState(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotebookModal;
