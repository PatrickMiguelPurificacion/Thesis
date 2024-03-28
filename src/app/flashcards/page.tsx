'use client';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import Modal from '../components/Modal-AddDeck';
import { getDocs, collection, query, where, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import EditDeckModal from '../components/Modal-EditDeck';
import {useRouter} from 'next/navigation';

export default function Home() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  const [decksArray, setDecksArray] = useState<{ [key: string]: any }[]>([]);
   const [modalState, setModalState] = useState(false)
   
  const [editDeckID, seteditDeckID] = useState('');
  const [editModalState, setEditModalState] = useState(false); // State to manage edit modal visibility
  const [editDeckDetails, setEditDeckDetails] = useState<{
    deckName: string;
    deckColor: string;
    cardNum: number;
    userID: string;
  }>({
    deckName: '',
    deckColor: '',
    cardNum: 0,
    userID: '',
  });

  //Sets the details needed to be passed to the modal
  const handleEdit = (deckId: string) => {
    const deck = decksArray.find(deck => deck.id === deckId);
    if (deck) {
      const { deckName, deckColor, cardNum, userID } = deck;
      setEditDeckDetails({ deckName, deckColor, cardNum, userID }); // Pass the correct type
      setEditModalState(true);
      seteditDeckID(deckId);
    } else {
      console.error('Error: Deck not found');
    }
  }
  
  const handleDelete = async (deckId: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this deck?");
    if (confirmation) {
      try {
        await deleteDoc(doc(db, 'decks', deckId));
        setDecksArray(decksArray.filter(deck => deck.id !== deckId));
        toast.success('Deck Deleted Successfully!');
      } catch (error) {
        console.error('Error deleting deck:', error);
        toast.error('Error deleting Deck');
      }
    }
  };  

  useEffect(() => {
    const getDecks = async () => {
      if (session.data?.user?.email) {
        const q = query(
          collection(db, 'decks'),
          where('userID', '==', session.data?.user?.email)
        );
        const querySnapshot = await getDocs(q);
        const decks = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setDecksArray(decks);
      }
    };
    getDecks();
    
  }, [session]);

  return (
    <div className="p-8">
      <div className='text-white'>{session?.data?.user?.email }</div>
      <button onClick={() => router.push('home')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Home
      </button>
      <br/>
      <button onClick={() => router.push('user-profile')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        User Profile
      </button>
      <br/>
      <button onClick={() => router.push('flashcards')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Flashcards
      </button>
      <br/>
      <button onClick={() => router.push('kanban')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Kanban Board
      </button>
      <br/>
      <button onClick={() => router.push('learn')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Learn Page
      </button>
      <br/>
      <button onClick={() => router.push('notebook')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Notebook
      </button>
      
      <h2 className="font-semibold leading-6 text-white text-center">
        Flashcard Decks
      </h2>
      <br/>
      <button
        className="disabled:opacity-40 flex w-full justify-center rounded-md bg-violet-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
        onClick={() => setModalState(true)}>
        Add New Deck
      </button>     
      <div>
        { modalState && <Modal setModalState={setModalState} /> }
      </div>
      <div className="flex flex-wrap mt-4">
        {decksArray.map((deck) => (
          <div key={deck.id} className="w-1/5 p-4">
            <button
              style={{ backgroundColor: deck.deckColor }}
              className="w-full h-full rounded-md p-10 text-gray-700 text-base"
            >
              <p className="text-center">{deck.deckName}<br />{deck.cardNum}</p>
              <button onClick={() => handleEdit(deck.id)} className='hover:text-white'>Edit Deck</button>
              <button onClick={() => handleDelete(deck.id)} className='hover:text-white'>Delete Deck</button>
            </button>
          </div>
        ))}
      </div>
      {editModalState &&
      <EditDeckModal
        setEditModalState={setEditModalState} // Pass state updater function to control modal visibility
        deckDetails={editDeckDetails} // Pass deck details to the modal
        deckID={editDeckID}
      />}
      <button className='text-white' onClick={() => signOut()}>Logout</button>
    </div>
  )
}

Home.requireAuth = true;