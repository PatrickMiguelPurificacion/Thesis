import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface NavBarProps {
  userEmail: string | null | undefined;
}

const NavBar: React.FC<NavBarProps> = ({ userEmail }) => {
  const router = useRouter();

  return (
    <div className="flex-none flex-col h-screen text-white w-1/5 overflow-y-auto" style={{ backgroundColor: '#142059' }}>

      <h1 className="text-base text-center my-5 font-bold text-white-700 border-b border-gray-100 pb-4 w-full">
        Navigation
      </h1>
      
      <div className="flex flex-col space-y-4">
        <button 
          onClick={() => router.push('/home')} 
          className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
        >
          Home
        </button>
        
        <button 
          onClick={() => router.push('/flashcard-decks')} 
          className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
        >
          Flashcards
        </button>
        <button 
          onClick={() => router.push('/kanban')} 
          className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
        >
          Kanban Board
        </button>
        <button 
          onClick={() => router.push('/learn')} 
          className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
        >
          Learn Page
        </button>
        <button 
          onClick={() => router.push('/notebook')} 
          className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
        >
          Notebook
        </button>
      </div>
      
      <div className="py-4 border-t border-gray-700 mt-4 space-y-4">
      <button 
          onClick={() => router.push('/user-profile')} 
          className="text-white w-full hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
        >
          User Profile
        </button>
        <button 
          onClick={() => signOut()}
          className="text-white w-full hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default NavBar;
