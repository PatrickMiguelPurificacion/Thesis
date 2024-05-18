import { setDoc, doc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState} from 'react';
import { db } from '../firebase';
import { toast } from 'sonner';

const EditNotebookModal = (props: {
  setEditModalState: (arg0: boolean) => void;
  notebookDetails: any;
  notebookID: any; //Takes the notebookID passed from the flashcard-notebooks page
}) => {
  //sets the value of notebook as the notebook details passed from the flashcards-notebook page
  const [notebook, setNotebook] = useState(props.notebookDetails);

  const { data: session } = useSession();

  const editNotebook = async () => {
    try {
      //For checking in the console
      console.log('Editing notebook:', notebook);
      console.log('Notebook ID:', props.notebookID);
      console.log('User ID:', session?.user?.email);

      // Ensure notebook ID is available
      if (!props.notebookID) {
        console.error('Error: Notebook ID not found');
        toast.error('Error updating Notebook');
        return;
      }
  
      // Update the specific notebook document
      await setDoc(doc(db, 'notebooks', props.notebookID), {
        notebookName: notebook.notebookName.trim(),
        userID: props.notebookDetails.userID.trim(),
        notesNum: props.notebookDetails.notesNum,
      });
  
      //Removes the modal state
      props.setEditModalState(false);
      toast.success('Notebook Updated Successfully! Reload Page to See Changes');
    } catch (error) {
      console.error('Error updating notebook:', error);
      toast.error('Error updating Notebook');
    }
  };
    
  //Handles the change of input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotebook({ ...notebook, [name]: value });
  };

  return (
    <>
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
        
          <table>
            <tbody>
              <tr>
                <td>
                  <button
                    onClick={() => props.setEditModalState(false)}
                    className="block text-gray-700 py-2 px-4 text-sm font-bold mb-2"
                  >
                    Cancel
                  </button>
                </td>
                <td>
                  <button
                    onClick={editNotebook}
                    className="align-baseline block text-gray-700 text-sm font-bold mb-2"
                  >
                    Save
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default EditNotebookModal;