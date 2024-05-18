import { setDoc, doc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState} from 'react';
import { db } from '../firebase';
import { toast } from 'sonner';

const EditDeckModal = (props: {
  setEditModalState: (arg0: boolean) => void;
  deckDetails: any;
  deckID: any; //Takes the deckID passed from the flashcard-decks page
}) => {
  //sets the value of deck as the deck details passed from the flashcards-deck page
  const [deck, setDeck] = useState(props.deckDetails);

  const { data: session } = useSession();

  const editDeck = async () => {
    try {
      //For checking in the console
      console.log('Editing deck:', deck);
      console.log('Deck ID:', props.deckID);
      console.log('User ID:', session?.user?.email);
      // Ensure deck ID is available
      if (!props.deckID) {
        console.error('Error: Deck ID not found');
        toast.error('Error updating Deck');
        return;
      }
  
      // Update the specific deck document
      await setDoc(doc(db, 'decks', props.deckID), {
        deckName: deck.deckName.trim(),
        deckColor: deck.deckColor.trim(),
        userID: props.deckDetails.userID.trim(),
        cardNum: props.deckDetails.cardNum,
      });
  
      //Removes the modal state
      props.setEditModalState(false);
      toast.success('Deck Updated Successfully! Reload Page to See Changes');
    } catch (error) {
      console.error('Error updating deck:', error);
      toast.error('Error updating Deck');
    }
  };
    
  //Handles the change of input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeck({ ...deck, [name]: value });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
       <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Deck Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="deckName"
              type="text"
              name="deckName"
              value={deck.deckName}
              onChange={handleInputChange}
              placeholder="Name of Your Deck"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Pick a Color
            </label>
            <input
              className="shadow appearance-none rounded w-full"
              id="deckColor"
              type="color"
              name="deckColor"
              value={deck.deckColor}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sample Deck
            </label>
          </div>
          <div
            className="block text-sm mb-2"
            style={{
              backgroundColor: deck.deckColor,
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
            }}
          >
            Your Custom Colored Deck
          </div>
          <br />
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
                    onClick={editDeck}
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

export default EditDeckModal;