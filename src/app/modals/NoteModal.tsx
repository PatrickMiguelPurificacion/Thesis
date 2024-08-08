import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createNote, updateNote } from '../services/NoteService';

interface Props {
  setModalState: (state: boolean) => void;
  initialNote?: any;
  noteID?: string | null;
  notebookID: string | null;
  highlightID?: string | null;
}

const NoteModal = ({ setModalState, initialNote, noteID, notebookID, highlightID }: Props) => {
  const { data: session } = useSession();
  const [note, setNote] = useState({
    noteTitle: '',
    noteContent: '',
    notebookID: notebookID,
    userID: session?.user?.email || '',
    highlightID: highlightID || '',
  });

  useEffect(() => {
    if (initialNote) {
      setNote({
        ...initialNote,
        userID: session?.user?.email || '',
      });
    }
  }, [initialNote, session]);

  // Handles the change of input for title
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNote({ ...note, [name]: value });
  };

  // Handles the change of input for content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote({ ...note, [name]: value });
  };

  const saveNote = async () => {
    if (!note.noteContent) {
      toast.error('Please add content to the note');
      return;
    }

    try {
      if (noteID) {
        // Update existing note
        await updateNote(noteID, note);
        toast.success('Note Updated Successfully!');
      } else {
        // Create new note
        await createNote(note, notebookID); // Creates a new note under a specific notebookID
        toast.success('Note Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Note');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="relative bg-white shadow-md rounded p-8 m-4 w-full max-w-xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Note Title {highlightID}</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="noteTitle"
            type="text"
            name="noteTitle"
            value={note.noteTitle}
            onChange={handleInputChange}
            placeholder="Note Title"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Note Content</label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="noteContent"
            name="noteContent"
            value={note.noteContent}
            onChange={handleTextareaChange}
            placeholder="Place your note here..."
            required
            rows={10}
            style={{ resize: 'none' }} // This prevents manual resizing by the user
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setModalState(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            onClick={saveNote}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {noteID ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
