'use client';

//Next.js and React
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {useRouter} from 'next/navigation';
import { useState, useEffect, useCallback} from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

//Components
import NavBar from '../components/NavBar';

//Modals
import DeckModal from '../modals/DeckModal';

//Firebase
import { getDocs, collection, query, where} from 'firebase/firestore';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';

//Notifications
import { toast } from 'sonner';
import { deleteDeck, fetchDecks } from '../services/DeckService';

export default function Decks() {
  //Ensures user is in session
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  //For Reviewing the Flashcards
    // Function to handle deck selection and view flashcards inside
    const handleReview = (deckId: string) => {
      router.push(`/flashcards?deckId=${deckId}`);
    };

  //Adding Decks
  const [decksArray, setDecksArray] = useState<{ [key: string]: any }[]>([]); //Stores decks retrieved from database
  const [deckModalState, setDeckModalState] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<any | null>(null); // For Storing the Deck to be edited

    /*When user clicks edit deck, the function searches the database for all the decks with the same userID
    as this session*/
    const getDecks = useCallback(async () => {
      if (session.data?.user?.email) {
        try {
          const decks = await fetchDecks(session.data.user.email);
          setDecksArray(decks);
        } catch (error) {
          console.error('Error fetching decks:', error);
          toast.error('Error Fetching Decks');
        }
      }
    }, [session]);

    useEffect(() => {
      getDecks();
    }, [session, getDecks]);

    // Adding a Deck
    const handleAddDeck = () => {
      setCurrentDeck(null);
      setDeckModalState(true);
    };

    //Editing Deck
    const handleEditDeck = (deck: any) => {
      setCurrentDeck(deck);
      setDeckModalState(true);
    };

  //Function for Deleting the Document based on the deckID
  const handleDelete = async (deckId: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this deck?");
    if (confirmation) {
      try {
        await deleteDeck(deckId);
        setDecksArray(decksArray.filter((deck) => deck.id !== deckId));
        toast.success('Deck Deleted Successfully!');
      } catch (error) {
        console.error('Error deleting deck:', error);
        toast.error('Error deleting Deck');
      }
    }
  }; 

  const handleModalClose = () => {
    setDeckModalState(false);
    getDecks(); // Refresh decks after closing the modal
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <NavBar userEmail={session?.data?.user?.email} />
       
      <div className="flex-grow overflow-y-auto p-8">
      
      <header className="text-white py-6 px-8 mb-2" style={{ backgroundColor: '#142059' }}>
        <h1 className="text-2xl font-semibold text-center">Flashcard Decks</h1>
      </header>

      <button
        className="disabled:opacity-40 flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-blue-600 bg-blue-500 mt-3"
        onClick={handleAddDeck}>
        Add New Deck
      </button>    
      
      {/* Modal to Handle Adding or Updating */} 
      <div>
        { deckModalState && (
        <DeckModal 
        setModalState={handleModalClose} // Use handleModalClose to refresh decks after closing the modal
        initialDeck={currentDeck}
        deckID={currentDeck?.id || null} />
        )}
      </div>

      <div className="flex flex-wrap mt-4 ">
        {decksArray.map((deck) => (
          <div
            key={deck.id}
            className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4 relative mb-4"
          >
            <div
              className="w-full h-full rounded py-16 text-gray-700 relative flex flex-col justify-between"
              style={{ backgroundColor: deck.deckColor }}
            >

            <div className="mt-auto">
              <div className="w-full text-sm text-white bg-opacity-70 bg-gray-800 px-4 pt-2 mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(deck.id)}
                  className={`text-white hover:bg-gray-800 py-2 px-2 rounded-md ${(deck.global && session?.data?.snapshot?.admin) || (!deck.global) ? '' : 'opacity-0 pointer-events-none'}`}
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => handleEditDeck(deck)}
                  className={`text-white hover:bg-gray-800 py-2 px-2 rounded-md ml-auto ${(deck.global && session?.data?.snapshot?.admin) || (!deck.global) ? '' : 'opacity-0 pointer-events-none'}`}
                >
                  <FaEdit />
                </button>
              </div>
              <button
                onClick={() => handleReview(deck.id)}
                className="w-full text-sm text-white bg-opacity-70 bg-gray-800 hover:bg-gray-800 py-2 px-4 mb-6 flex flex-col items-center"
              >
                <p className="text-center text-base text-white">{deck.deckName}</p>
                <p className="text-center text-xs text-white mt-1 pb-4">Number of Cards: {deck.cardNum}</p>
              </button>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}

Decks.requireAuth = true;
