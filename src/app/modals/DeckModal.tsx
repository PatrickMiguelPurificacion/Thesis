import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { addDeck, updateDeck } from '../services/DeckService';

interface Props {
  setModalState: (state: boolean) => void;
  initialDeck?: { deckName: string; deckColor: string; cardNum: number; userID: string };
  deckID?: string | null;
}

const DeckModal = ({ setModalState, initialDeck, deckID }: Props) => {
  const { data: session } = useSession();
  
  const [selectedColor, setSelectedColor] = useState(initialDeck?.deckColor || "");// Initialize with initialDeck color if editing
  
  const [deck, setDeck] = useState({
    deckName: initialDeck?.deckName || '',
    deckColor: initialDeck?.deckColor || '',
    cardNum: initialDeck?.cardNum || 0,
    userID: session?.user?.email || '',
  });

  useEffect(() => {
    if (initialDeck) {
      setDeck({
        deckName: initialDeck.deckName || '',
        deckColor: initialDeck.deckColor || '',
        cardNum: initialDeck.cardNum || 0,
        userID: session?.user?.email || '',
      });
    }
  }, [initialDeck, session]);

  function colorSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setSelectedColor(value); // Update selected color state
    setDeck({ ...deck, deckColor: value }); // Update deck color in deck state
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeck({ ...deck, [name]: value });
  };

  const saveDeck = async () => {
    try {
      if (deckID) {
        // Update existing deck
        await updateDeck(deckID, deck);
        toast.success('Deck Updated Successfully!');
      } else {
        // Create new deck
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
              value={deck.deckColor}
              name="deckColor"
              onChange={colorSelected}
            />
          </div>
            
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sample Deck
            </label>      
          </div>
          <div className="block text-sm mb-2"
            style={{ backgroundColor: selectedColor, padding: '1rem', borderRadius: '0.5rem', textAlign:'center' }}>
            Your Custom Colored Deck
          </div><br/>

          <div className="flex justify-between">
            <button onClick={() => setModalState(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Cancel
            </button>
            <button onClick={saveDeck} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {deckID ? 'Update' : 'Create'}
            </button>
          </div>

        </div>
      </div>
    )
  };

export default DeckModal;
