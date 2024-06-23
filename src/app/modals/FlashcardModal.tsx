import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createFlashcard, updateFlashcard} from '../services/FlashcardService';

interface Props {
  setModalState: (state: boolean) => void;
  initialFlashcard?: any;
  cardID?: string | null;
  reviewID?: string | null;
  deckId: string | null;
}

const FlashcardModal = ({ setModalState, initialFlashcard, cardID, deckId }: Props) => {
  const { data: session } = useSession();
  const [flashcard, setFlashcard] = useState({
    cardQuestion: '',
    cardAnswer: '',
    deckID: deckId,
    userID: session?.user?.email || '',
    lastReviewTime: new Date(),
    nextReviewTime: new Date(),
    interval: 1,
    easeFactor: 2.5,
  });

  useEffect(() => {
    if (initialFlashcard) {
      setFlashcard({
        ...initialFlashcard,
        userID: session?.user?.email || '',
      });
    }
  }, [initialFlashcard, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFlashcard({ ...flashcard, [name]: value });
  };

  const saveFlashcard = async () => {
    try {
      if (cardID) {
        // Update existing flashcard
        await updateFlashcard(cardID, flashcard);
        toast.success('Card Updated Successfully!');
      } else {
        // Create new flashcard
        const newCardID = await createFlashcard(flashcard, deckId);
        
        toast.success('Flashcard Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Flashcard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Flashcard Question
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="cardQuestion"
            type="text"
            name="cardQuestion"
            value={flashcard.cardQuestion}
            onChange={handleInputChange}
            placeholder="Your Flashcard's Question"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Flashcard Answer
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="cardAnswer"
            type="text"
            name="cardAnswer"
            value={flashcard.cardAnswer}
            onChange={handleInputChange}
            placeholder="Your Flashcard's Answer"
            required
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={saveFlashcard}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {cardID ? 'Update' : 'Create'}
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

export default FlashcardModal;
