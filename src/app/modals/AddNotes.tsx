'use client';

import { addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { db } from '../firebase';
import { toast } from 'sonner';

interface Props {
  setAddNoteModalState: (arg0: boolean) => void;
  notebookId: string | null; // Make notebookId prop accept string or null
}

const AddNoteModal = ({ setAddNoteModalState, notebookId }: Props) => {
  const [newNote, setNote] = useState({ noteTitle: '', noteContent: '', notebookID: notebookId, userID: '' });
  const { data: session } = useSession();

  const addNote = async () => {
    try {
      // Add note to Firestore
      const noteRef = await addDoc(collection(db, 'notes'), {
        noteTitle: newNote.noteTitle.trim(),
        noteContent: newNote.noteContent.trim(),
        notebookID: newNote.notebookID,
        userID: session?.user?.email,
      });

      // Check if notebookId is not null before updating notesNum
      if (notebookId) {
        // Update notesNum in the corresponding deck document
        const notebookRef = doc(db, 'notebooks', notebookId); // Reference to the deck document
        await updateDoc(notebookRef, {
          notesNum: increment(1), // Increment notesNum by 1
        });
      }

      setAddNoteModalState(false);
      toast.success('Note Created Successfully!');
    } catch (error: any) {
      console.error('Error creating note:', error.message);
      toast.error('Error creating Note');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Note Title</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            onChange={(e) => setNote({ ...newNote, noteTitle: e.target.value })}
            placeholder="Note Title"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Note Content</label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="content"
            onChange={(e) => setNote({ ...newNote, noteContent: e.target.value })}
            placeholder="Place your note here..."
            required
            rows={10}
            style={{ resize: 'none' }} // This prevents manual resizing by the user
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setAddNoteModalState(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await addNote();
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNoteModal;
