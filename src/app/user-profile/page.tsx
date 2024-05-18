'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import NavBar from '../components/NavBar';

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

  // Fetches the user details
  useEffect(() => {
    const fetchUserDetails = () => {
      if (session?.user?.email) {
        // Calls the user database and finds the user with the same email as the current session
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', session.user.email));
        getDocs(q)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              querySnapshot.forEach((doc) => {
                const userData = doc.data() as UserDetails;
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
      <div className="flex h-screen">
        <NavBar userEmail={session?.user?.email} />
        <div className="flex-grow overflow-y-auto bg-gray-300 p-8">
          <div className="mb-5">
            <div className="bg-custom-blue p-4 shadow-md mb-4 rounded-lg" style={{ backgroundColor: '#142059' }}>
              <h2 className="text-xl text-white font-semibold mb-7 mt-2">User Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-white font-semibold">First Name:</div>
                  <div className="bg-gray-200 p-2 rounded-md">{userDetails?.firstname}</div>
                </div>
                <div>
                  <div className="text-white font-semibold">Last Name:</div>
                  <div className="bg-gray-200 p-2 rounded-md">{userDetails?.lastname}</div>
                </div>
                <div>
                  <div className="text-white font-semibold">Email:</div>
                  <div className="bg-gray-200 p-2 rounded-md">{session?.user?.email}</div>
                </div>
                <div>
                  <div className="text-white font-semibold">Student Number:</div>
                  <div className="bg-gray-200 p-2 rounded-md">{userDetails?.studentNum}</div>
                </div>
              </div>
              <div className="mt-10">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


Profile.requireAuth = true;
