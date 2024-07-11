'use client';

//Next.js and React
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

//Components
import NavBar from '../../components/NavBar';

//Modals
import DeckModal from '../../modals/DeckModal';

//Notifications
import Deck from '@/app/components/Deck';
import { toast } from 'sonner';
import { deleteDeck, fetchDecks } from '../../services/DeckService';

export default function Decks() {
  //Ensures user is in session
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  // if (!session?.data?.snapshot?.admin)
  //   return redirect('/home');

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
          const decks = await fetchDecks('global');
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
      <NavBar />
       
      <div className="flex-grow overflow-y-auto p-8">
      
      <header className="text-white py-6 px-8 mb-2" style={{ backgroundColor: '#142059' }}>
        <h1 className="text-2xl font-semibold text-center">Global Flashcard Decks</h1>
      </header>

      <button
        className="disabled:opacity-40 flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-blue-600 bg-blue-500 mt-3"
        onClick={handleAddDeck}>
        Add New Global Deck
      </button>    
      
      {/* Modal to Handle Adding or Updating */} 
      <div>
        { deckModalState && (
        <DeckModal 
        setModalState={handleModalClose} // Use handleModalClose to refresh decks after closing the modal
        initialDeck={currentDeck}
        deckID={currentDeck?.id || null}
        isGlobal={true}
        />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4 gap-8">
        {decksArray.map((deck, idx) => (
          <React.Fragment key={`deck-${idx}`}>
          <Deck
            deck={deck}
            handleDelete={handleDelete}
            handleEditDeck={handleEditDeck}
            handleReview={handleReview}
            isAdmin={session?.data?.snapshot?.admin}
            email={session?.data?.user?.email}
          />
          </React.Fragment>
        ))}
      </div>
    </div>
    </div>
  )
}

Decks.requireAuth = true;
