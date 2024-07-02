import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { addDeck, updateDeck } from '../services/DeckService';
import { FaTrash, FaEdit } from 'react-icons/fa';

interface Props {
  setModalState: (state: boolean) => void;
  initialDeck?: { deckName: string; deckColor: string; cardNum: number; userID: string };
  deckID: string | null;
}

const DEFAULT_COLOR = '#142059'; // Set your default color here

const DeckModal = ({ setModalState, initialDeck, deckID }: Props) => {
  const { data: session } = useSession();
  
  const [selectedColor, setSelectedColor] = useState(initialDeck?.deckColor || DEFAULT_COLOR);
  
  const [deck, setDeck] = useState({
    deckName: initialDeck?.deckName || '',
    deckColor: initialDeck?.deckColor || DEFAULT_COLOR,
    cardNum: initialDeck?.cardNum || 0,
    userID: session?.user?.email || '',
    global: false,
  });

  useEffect(() => {
    if (initialDeck) {
      setDeck({
        deckName: initialDeck.deckName || '',
        deckColor: initialDeck.deckColor || DEFAULT_COLOR,
        cardNum: initialDeck.cardNum || 0,
        userID: session?.user?.email || '',
        global: false,
      });
      setSelectedColor(initialDeck.deckColor || DEFAULT_COLOR);
    }
  }, [initialDeck, session]);

  function colorSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setSelectedColor(value);
    setDeck({ ...deck, deckColor: value });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeck({ ...deck, [name]: value });
  };

  const saveDeck = async () => {
    if (!deck.deckName.trim()) {
      toast.error('Deck name is required!');
      return;
    }

    try {
      if (deckID) {
        await updateDeck(deckID, deck);
        toast.success('Deck Updated Successfully!');
      } else {
        await addDeck(deck);
        toast.success('Deck Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Deck');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"> 
      <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl flex">
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/2 pr-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Deck Name
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" 
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
              className="shadow appearance-none rounded h-10 w-full"   
              id="deckColor" 
              type="color"
              value={deck.deckColor}
              name="deckColor"
              onChange={colorSelected}
            />
            <p className="text-sm mt-4">Check the Color on the Sample Deck on the Right</p>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setModalState(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Cancel
            </button>
            <button onClick={saveDeck} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {deckID ? 'Update' : 'Create'}
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/3 lg:w-2/3 xl:w-1/2 pl-8 pr-4">
          <div className="w-full h-full rounded py-16 text-gray-700 relative flex flex-col justify-between" style={{ backgroundColor: selectedColor }}>
            <div className="w-full text-sm text-white bg-opacity-70 bg-gray-800 px-4 pt-2 mt-4 flex items-center justify-between">
              <div className="hover:bg-gray-800 text-white py-2 px-2 rounded-md">
                <FaTrash />
              </div>
              <div className="hover:bg-gray-800 text-white py-2 px-2 rounded-md ml-auto">
                <FaEdit />
              </div>
            </div>
            <div className="w-full text-sm text-white bg-opacity-70 bg-gray-800 hover:bg-gray-800 py-2 px-4 mb-6 flex flex-col items-center">
              <p className="text-center text-base text-white">Sample Deck</p>
              <p className="text-center text-xs text-white mt-1 pb-4">Number of Cards: {deck.cardNum}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckModal;
