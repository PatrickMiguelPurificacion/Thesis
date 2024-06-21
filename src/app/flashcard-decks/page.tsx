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
  const [deckModalState, setDeckModalState] = useState(false)
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
       
      <div className="flex-grow p-8">
      
      <header className="text-white py-6 px-8 mb-2" style={{ backgroundColor: '#142059' }}>
        <h1 className="text-2xl font-semibold text-center">Flashcard Decks</h1>
      </header>

      <button
        className="disabled:opacity-40 flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
        style={{ backgroundColor: '#364BA8' }}
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

      <div className="flex flex-wrap mt-4">
        {decksArray.map((deck) => (
          <div
            key={deck.id}
            className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4 relative mb-4"
          >
            <div
              className="w-full h-full rounded-md p-8 text-gray-700 text-base hover:bg-gray-200 transition duration-300 relative flex flex-col justify-between"
              style={{ backgroundColor: deck.deckColor }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2"> {/* Icons and Count */}
                  <button
                    onClick={() => handleEditDeck(deck)}
                    className="text-white hover:bg-blue-900 py-1 px-2 rounded-md"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(deck.id)}
                    className="text-white hover:bg-blue-900 py-1 px-2 rounded-md"
                  >
                    <FaTrash />
                  </button>
                  <p className="text-right text-xs text-white">Count: {deck.cardNum}</p> {/* Count */}
                </div>
              </div>
              <p className="text-center mb-4">{deck.deckName}</p> {/* Deck Name */}
              <div className="mt-auto">
                <button
                  onClick={() => handleReview(deck.id)}
                  className="w-full text-sm text-white hover:bg-blue-900 py-2 px-4 rounded-b-md"
                  style={{ backgroundColor: '#364BA8' }}
                >
                  View Flashcards
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
