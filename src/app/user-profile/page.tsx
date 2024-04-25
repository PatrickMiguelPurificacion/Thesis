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
    <div className="flex h-screen"> {/* Set the parent container to flex and full screen height */}
      {session && (
        <>
          <NavBar userEmail={session?.user?.email} /> {/* Calls the NavBar component */}
          <div className="flex-grow bg-gray-100 p-8"> {/* Utilize the remaining space and add padding */}
            <div className="text-gray-800 text-2xl font-bold mb-4">User Profile</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-800 font-semibold">Email:</div>
              <div className="text-gray-600">{session.user?.email}</div>
              {userDetails && (
                <>
                  <div className="text-gray-800 font-semibold">First Name:</div>
                  <div className="text-gray-600">{userDetails.firstname}</div>
                  <div className="text-gray-800 font-semibold">Last Name:</div>
                  <div className="text-gray-600">{userDetails.lastname}</div>
                  <div className="text-gray-800 font-semibold">Student Number:</div>
                  <div className="text-gray-600">{userDetails.studentNum}</div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Profile.requireAuth = true;
