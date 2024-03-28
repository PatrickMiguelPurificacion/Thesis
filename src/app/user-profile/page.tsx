'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { redirect, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface UserDetails {
  firstname: string;
  lastname: string;
  studentNum: number;
}

export default function Profile() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/signin');
    },
  });

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = () => {
      if (session?.user?.email) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', session.user.email));
        getDocs(q)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              querySnapshot.forEach((doc) => {
                const userData = doc.data() as UserDetails;
                console.log('User details:', userData);
                setUserDetails(userData);
              });
            } else {
              console.log('User details not found');
            }
          })
          .catch((error) => {
            console.error('Error fetching user details:', error);
          });
      }
    };

    if (session && session.user?.email) {
      fetchUserDetails();
    }
  }, [session]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      {session && (
        <>
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
      
      <br/><br/><br/>
          <div className="text-white">Email: {session.user?.email}</div>
          {userDetails && (
            <>
              <div className="text-white">First Name: {userDetails.firstname}</div>
              <div className="text-white">Last Name: {userDetails.lastname}</div>
              <div className="text-white">Student Number: {userDetails.studentNum}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}

Profile.requireAuth = true;
