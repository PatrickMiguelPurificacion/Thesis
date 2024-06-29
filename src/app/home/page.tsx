'use client';

import { signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import { FaBook, FaChalkboard, FaBookReader, FaArrowRight } from 'react-icons/fa'; 
import { IoMdCard } from 'react-icons/io'; 

export default function Home() {

  // Making sure that user is authenticated. If not, they are redirected to the sign-in page
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  // Sample data to replace placeholders
  const keepNotes = "Learn from the Learn Page and Highlight your learnings. Note what you learned on your notebook.";
  const flashcardsToReview = "Make sure to go through your flashcards daily. Check if you have any reviews today.";
  const nextDeadlines = "Keep track of your upcoming deadlines to stay on top of your studies.";

  return (
    <div className="flex h-screen"> {/* Set the parent container to flex and full screen height */}
      <NavBar userEmail={session?.data?.user?.email} /> {/* Calls the NavBar component */}
      
      <div className="flex-grow overflow-y-auto bg-gray-100 p-8"> {/* Utilize the remaining space and add padding */}
        <div className="mb-5">
          {/* Application Data Box */}
          <div className="bg-white p-4 shadow-md mb-4 flex items-center"> {/* Set display to flex and align items to center */}
            <img className="h-20 w-30 mx-3" src="https://i.ibb.co/fYbdZkM/Secu-Spire.png" alt="SecuSpire logo" /> {/* Margin right for spacing */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Secuspire</h2>
              <p>Learn Information Security and Assurance using Spaced Repetition and Other Features</p>
            </div>
          </div>

        </div>

      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
       
          <div className="bg-white p-4 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Review Everyday</h2>
            <p>{flashcardsToReview}</p>
          </div>

          <div className="bg-white p-4 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Track Deadlines</h2>
            <p>{nextDeadlines}</p>
          </div>
         
          <div className="bg-white p-4 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Highlight and Keep Notes</h2>
            <p>{keepNotes}</p>
          </div>

        </div>

        {/* Divider */}
        <hr className="mt-6 mb-4 border-t-2 border-gray-300" />

        {/* Features Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          {/* Four Cards with Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Card 1 */}
            <div className="bg-white p-10 rounded-md shadow-md text-center">
              <div className="mb-2">
                <IoMdCard size={24} className="mx-auto" /> 
              </div>
              <h2 className="text-xl font-semibold mb-2"> 
                Flashcards 
              </h2>
              <p>Review your lessons daily</p>
              <button onClick={() => router.push('/flashcard-decks')} className="flex mt-3 text-blue-500"><FaArrowRight className="mt-1 mr-2" />See Card Decks</button>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-10 rounded-md shadow-md text-center">
              <div className="mb-2">
                <FaChalkboard size={24} className="mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-2"> 
                Kanban Board
              </h2>
              <p>Manage and organize your tasks</p>
              <button onClick={() => router.push('/kanban')} className="flex ml-5 mt-3 text-blue-500"><FaArrowRight className="mt-1 mr-2" /> See Tasks</button>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-10 rounded-md shadow-md text-center">
              <div className="mb-2">
                <FaBookReader size={24} className="mx-auto" /> 
              </div>
              <h2 className="text-xl font-semibold mb-2"> 
                Learn
              </h2>
              <p>Study your course materials</p>
              <button onClick={() => router.push('/learn')} className="flex mt-3 ml-3 text-blue-500"><FaArrowRight className="mr-2 mt-1" />See Material</button>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-10 rounded-md shadow-md text-center">
              <div className="mb-2">
                <FaBook size={24} className="mx-auto" /> 
              </div>
              <h2 className="text-xl font-semibold mb-2"> 
                Notebook
              </h2>
              <p>Add notes on your materials</p>
              <button onClick={() => router.push('/notebook')} className="flex mt-3 text-blue-500"><FaArrowRight className="mr-2 mt-1" />See Notebooks</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

Home.requireAuth = true;
