import { setDoc, doc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState} from 'react';
import { db } from '../firebase';
import { toast } from 'sonner';

const EditFlashcardModal = (props: {
  setEditModalState: (arg0: boolean) => void;
  flashcardDetails: any;
  cardID: any; //Takes the value of the cardID passed from the flashcards page
}) => {
  //sets the value of card as the card details passed from the flashcards page
  const [card, setCard] = useState(props.flashcardDetails);

  const { data: session } = useSession();

  const editCard = async () => {
    try {
      //For checking in the console
      console.log('Editing card:', card);
      console.log('Card ID:', props.cardID);
      console.log('User ID:', session?.user?.email);

      // Ensure card ID is available
      if (!props.cardID) {
        console.error('Error: Card ID not found');
        toast.error('Error updating Card');
        return;
      }
  
      // Update the specific card document
      await setDoc(doc(db, 'flashcards', props.cardID), {
        cardQuestion: card.cardQuestion.trim(),
        cardAnswer: card.cardAnswer.trim(),
        deckID: card.deckID,
        userID: props.flashcardDetails.userID.trim(), //Gets the userID as is
        lastReviewTime: props.flashcardDetails.lastReviewTime, //Gets the lastReviewTime without changing it
        interval: props.flashcardDetails.interval, //Gets the interval without changing it
        easeFactor: props.flashcardDetails.easeFactor, //Gets the easeFactor without changing it
      });
  
      //Removes the modal state
      props.setEditModalState(false);
      toast.success('Card Updated Successfully! Reload Page to See Changes');
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Error updating Card');
    }
  };
    
  //Handles the change of input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCard({ ...card, [name]: value });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
       <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Card Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="deckName"
              type="text"
              name="deckName"
              value={card.deckName}
              onChange={handleInputChange}
              placeholder="Name of Your Card"
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
              value={card.deckColor}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sample Card
            </label>
          </div>
          <div
            className="block text-sm mb-2"
            style={{
              backgroundColor: card.deckColor,
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
            }}
          >
            Your Custom Colored Card
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
                    onClick={editCard}
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

export default EditFlashcardModal;