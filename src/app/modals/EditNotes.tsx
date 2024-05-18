import { setDoc, doc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { db } from '../firebase';
import { toast } from 'sonner';

const EditNoteModal = (props: {
  setEditNoteModalState: (arg0: boolean) => void;
  noteDetails: any;
  noteID: any; //Takes the noteID passed from the flashcard-decks page
}) => {
  //sets the value of note as the note details passed from the flashcards-note page
  const [note, setNote] = useState(props.noteDetails);

  const { data: session } = useSession();

  const editNote = async () => {
    try {
      //For checking in the console
      console.log('Editing note:', note);
      console.log('Note ID:', props.noteID);
      console.log('User ID:', session?.user?.email);
      // Ensure note ID is available
      if (!props.noteID) {
        console.error('Error: Note ID not found');
        toast.error('Error updating Note');
        return;
      }
  
      // Update the specific note document
      await setDoc(doc(db, 'notes', props.noteID), {
        noteTitle: note.noteTitle.trim(),
        noteContent: note.noteContent.trim(),
        notebookID: props.noteDetails.notebookID.trim(),
        userID: props.noteDetails.userID.trim(),
      });
  
      //Removes the modal state
      props.setEditNoteModalState(false);
      toast.success('Note Updated Successfully! Reload Page to See Changes');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Error updating Note');
    }
  };
    
  //Handles the change of input for title
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNote({ ...note, [name]: value });
  };

  //Handles the change of input for content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote({ ...note, [name]: value });
  };

  return (
    <>
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Note Title</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
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
            id="content"
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
            onClick={() => props.setEditNoteModalState(false)}
            className="block text-gray-700 py-2 px-4 text-sm font-bold mb-2"
          >
            Cancel
          </button>
          <button
            onClick={editNote}
            className="align-baseline block text-gray-700 text-sm font-bold mb-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default EditNoteModal;
