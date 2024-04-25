import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface NavBarProps {
  userEmail: string | null | undefined;
}

const NavBar: React.FC<NavBarProps> = ({ userEmail }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white w-1/5">
      <div className="py-4 px-6 text-xl font-bold">{userEmail}</div>
      
      <div className="flex flex-col space-y-4">
        <button 
          onClick={() => router.push('/home')} 
          className="nav-link hover:bg-gray-700 py-2 px-6 rounded-md transition duration-300 ease-in-out"
        >
          Home
        </button>
        <button 
          onClick={() => router.push('/user-profile')} 
          className="nav-link hover:bg-gray-700 py-2 px-6 rounded-md transition duration-300 ease-in-out"
        >
          User Profile
        </button>
        <button 
          onClick={() => router.push('/flashcard-decks')} 
          className="nav-link hover:bg-gray-700 py-2 px-6 rounded-md transition duration-300 ease-in-out"
        >
          Flashcards
        </button>
        <button 
          onClick={() => router.push('/kanban')} 
          className="nav-link hover:bg-gray-700 py-2 px-6 rounded-md transition duration-300 ease-in-out"
        >
          Kanban Board
        </button>
        <button 
          onClick={() => router.push('/learn')} 
          className="nav-link hover:bg-gray-700 py-2 px-6 rounded-md transition duration-300 ease-in-out"
        >
          Learn Page
        </button>
        <button 
          onClick={() => router.push('/notebook')} 
          className="nav-link hover:bg-gray-700 py-2 px-6 rounded-md transition duration-300 ease-in-out"
        >
          Notebook
        </button>
      </div>
      <div className="flex-grow"></div>
      <div className="py-4 px-6 text-sm border-t border-gray-700">
        <button 
          onClick={() => signOut()}
          className="text-white w-full hover:bg-gray-700 py-2 px-6 rounded-md transition duration-300 ease-in-out"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default NavBar;
