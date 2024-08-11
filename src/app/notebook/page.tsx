'use client';

// Next.js and React
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

// Components
import NavBar from '../components/NavBar';

// Modals
import NotebookModal from '../modals/NotebookModal';
import NoteModal from '../modals/NoteModal';

// Services
import { deleteNotebook, fetchNotebooks } from '../services/NotebookService';
import { deleteNote, fetchNotes } from '../services/NoteService';

// Notifications
import { toast } from 'sonner';
import { getHighlight, Highlighter } from '../services/HighlightService';

export default function Notebook() {
  // Ensures user is in session
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  // Adding Notebook
  const [notebooksArray, setNotebooksArray] = useState<{ [key: string]: any }[]>([]); // Stores notebooks retrieved from database
  const [notebookModalState, setNotebookModalState] = useState(false); // For showing the notebook modal or not
  const [selectedNotebookId, setSelectedNotebookId] = useState(''); // Gets the Notebook Selected for ViewNotes
  const [currentNotebook, setCurrentNotebook] = useState<any | null>(null); // For Storing the Notebook to be edited

  const [highlights, setHighlights] = useState<{[key:string]: Highlighter}>({});

  
    const getNotebooks = useCallback(async () => {
      if (session.data?.user?.email) {
        try {
          const notebooks = await fetchNotebooks(session.data.user.email); // Call fetchNotebooks function with the user email
          setNotebooksArray(notebooks);
        } catch (error) {
          console.error('Error fetching notebooks:', error);
          toast.error('Error Fetching Notebooks');
        }
      }
  }, [session]);

  useEffect(() => {
    getNotebooks();
  }, [session, getNotebooks]);

  // Function to handle notebook selection and view notes inside
  const handleViewNotes = (notebookId: string) => {
    setSelectedNotebookId(notebookId);
  };

  // Adding a Notebook
  const handleAddNotebook = () => {
    setCurrentNotebook(null);
    setNotebookModalState(true);
  };

  // Editing Notebook
  const handleEditNotebook = (notebook: any) => {
    console.log('Editing notebook:', notebook.id);
    setCurrentNotebook(notebook);
    setNotebookModalState(true);
  };

  const handleNotebookModalClose = () => {
    setNotebookModalState(false);
    getNotebooks(); // Refresh Notebooks after closing the modal
  };

  // Function for Deleting the Document based on the notebookID
  const handleDeleteNotebook = async (notebookId: string) => {
    const confirmation = window.confirm('Are you sure you want to delete this notebook?');
    if (confirmation) {
      try {
        await deleteNotebook(notebookId);
        setNotebooksArray(notebooksArray.filter((notebook) => notebook.id !== notebookId));
        toast.success('Notebook Deleted Successfully!');
        getNotes(); // Refreshes Notes when Notebook is deleted
      } catch (error) {
        console.error('Error deleting notebook:', error);
        toast.error('Error deleting Notebook');
      }
    }
  };




  // For Notes
  const [noteModalState, setNoteModalState] = useState(false);
  const [notesArray, setNotesArray] = useState<{ [key: string]: any }[]>([]); // Placing the notes in an array
  const [currentNote, setCurrentNote] = useState<any | null>(null); // For Storing the Notebook to be edited

  // Gets the Note Data from the Database and stores them in an array
    const getNotes = useCallback(async () => {
      if (selectedNotebookId) {
        try {
          const notes = await fetchNotes(selectedNotebookId); // Call fetchNotes function with the selected notebook ID

          const promises: Promise<any>[] = [];
          notes.forEach(note => {
            if (note.highlightID != null) {
              promises.push(new Promise(async (res, rej) => {
                const h = await getHighlight(note.highlightID!);
                res(h);
              }));
            }
          });

          Promise.all(promises).then((values) => {
            console.log(values);
            
            const h = {...highlights};
            values.forEach(value => {
              h[value.id] = value;
            });
            setHighlights(h);
          })

          setNotesArray(notes);
        } catch (error) {
          console.error('Error fetching notes:', error);
          toast.error('Error Fetching Notebooks');
        }
      }
  }, [selectedNotebookId]);

  console.log(highlights);

  useEffect(() => {
    getNotes();
  },[selectedNotebookId, getNotes])

  // Adding Notes
  const handleAddNote = () => {
    setCurrentNote(null);
    setNoteModalState(true);
  };

  // Edit Note
  const handleEditNote = (note: any) => {
    console.log('Editing note:', note.id);
    setCurrentNote(note);
    setNoteModalState(true);
  };

  // Function for Deleting the Document based on the noteID
  const handleNoteDelete = async (noteId: string) => {
    const confirmation = window.confirm('Are you sure you want to delete this note?');
    if (confirmation) {
      try {
        await deleteNote(noteId,selectedNotebookId);
        setNotesArray(notesArray.filter((note) => note.id !== noteId));
        toast.success('Note Deleted Successfully!');
        getNotebooks(); // Refresh getting the Notes
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Error deleting Note');
      }
    }
  };

  const handleNoteModalClose = () => {
    setNoteModalState(false);
    getNotes(); // Refresh notes after closing the modal
    getNotebooks(); // Refresh Notebooks after closing the modal
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-y-auto">
      <NavBar />

      <div className="flex-grow p-8 overflow-y-auto flex flex-col h-full">
        <header className="text-white py-6 px-8" style={{ backgroundColor: '#142059' }}>
          <h1 className="text-2xl font-semibold text-center">Notebooks</h1>
        </header>

        {/* This is for the Notebook Section of the Page */}
        <div className="flex min-h-0 grow">
          <div className="w-1/3 pr-4 border-r border-gray-300 overflow-y-auto">
            <div className="mt-4 overflow-y-auto">
              {notebooksArray.map((notebook) => (
                <div key={notebook.id} className="mb-4">
                  <div
                    className={`cursor-pointer p-4 ${
                      selectedNotebookId === notebook.id ? 'bg-blue-200' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => handleViewNotes(notebook.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-lg font-semibold">{notebook.notebookName}</p>
                      <div className="space-x-2">
                        <button onClick={() => handleEditNotebook(notebook)} className="text-gray-500 hover:text-gray-800">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteNotebook(notebook.id)} className="text-gray-500 hover:text-gray-800">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Notes: {notebook.notesNum}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <button
                className="disabled:opacity-40 w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white bg-blue-500 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                onClick={handleAddNotebook}
              >
                Add New Notebook
              </button>

              {/* Handles the Modal for Adding and Updating Notebooks */}
              {notebookModalState && (
              <NotebookModal 
                setModalState={handleNotebookModalClose} 
                initialNotebook={currentNotebook}
                notebookID={currentNotebook?.id || null}
                />
              )}

            </div>
          </div>

          {/* This is for the Notes Section of the Page */}
          <div className="w-2/3 pl-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold mt-4">Notes</h2>
              {selectedNotebookId && ( //Ensures that the Add New Note Button only shows up when there is a notebook selected
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                  onClick={handleAddNote}
                >
                  Add New Note
                </button>
              )}
            </div>
            {/* Render Notes section here based on selectedNotebookId */}
            {noteModalState && (
              <NoteModal 
              setModalState={handleNoteModalClose} 
              initialNote={currentNote}
              noteID={currentNote?.id || null}
              notebookID={selectedNotebookId}
               />
            )}

            {/* Displaying the Notes on one side of the screen */}
            <div className="mt-4 overflow-y-auto">
              {notesArray.map((note) => (
                <div key={note.id} className="w-full mb-4 border rounded-md overflow-hidden shadow-md">
                  <div className="p-4 bg-yellow-200">
                    {note.highlightID && (
                      <p
                        style={{
                          backgroundColor: highlights[note.highlightID]?.color ?? "white",
                        }}
                        className="px-1 rounded-md mb-2 w-fit"
                      >{highlights[note.highlightID]?.highlightedText ?? ""}</p>
                    )}
                    <div className="flex justify-between items-center">

                      <h3 className="text-lg font-semibold mb-2">{note.noteTitle}</h3>
                      <div className="space-x-2">
                        <button onClick={() => handleEditNote(note)} className="text-gray-500 hover:text-gray-800">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleNoteDelete(note.id)} className="text-gray-500 hover:text-gray-800">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 break-words">{note.noteContent}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

Notebook.requireAuth = true;
