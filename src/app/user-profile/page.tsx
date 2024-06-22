'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBar from '../components/NavBar';
import { fetchUserDetails } from '../services/UserService';
import ProfileEditModal from '../modals/UserModal';
import { toast } from 'sonner';

export default function Profile() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();
  
  //Fetching the Details
  const [detailsArray, setDetailsArray] = useState<{ [key: string]: any }[]>([]); //Stores user retrieved from database which should only have 1 item
  const [profileModalState, setProfileModalState] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<any | null>(null); // For Storing the Details to be edited

  // Gets the user details
      const getUserDetails = useCallback(async () => {
      if (session?.data?.user?.email) {
        try{
        // Calls the user database and finds the user with the same email as the current session
        const user = await fetchUserDetails(session.data.user.email);
        setDetailsArray(user);
        } catch(error) {
            console.error('Error fetching user details:', error);
            toast.error('Error Fetching User Details');
        }
      }
    },[session]);

    useEffect(() => {
      getUserDetails();
    }, [session, getUserDetails]);

    //Editing User Profile
    const handleEditDetails = (details: any) => {
      setCurrentDetails(details);
      setProfileModalState(true);
    };

    const handleModalClose = () => {
      setProfileModalState(false);
      getUserDetails(); // Refresh details after closing the modal
    };

    return (
      <div className="flex h-screen">
        <NavBar userEmail={session?.data?.user?.email} />
        <div className="flex-grow overflow-y-auto bg-gray-300 p-8">
          <div className="mb-5">
            <div className="bg-custom-blue p-4 shadow-md mb-4 rounded-lg" style={{ backgroundColor: '#142059' }}>
              <h2 className="text-xl text-white font-semibold mb-5 mt-2">User Profile</h2>
              {detailsArray.map((details) => (
                <div key={details.id} className="grid gap-4">
                <div>
                  <div className="text-white font-semibold">First Name:</div>
                  <div className="bg-gray-200 p-2 rounded-md">{details.firstname}</div>
                </div><div>
                    <div className="text-white font-semibold">Last Name:</div>
                    <div className="bg-gray-200 p-2 rounded-md">{details.lastname}</div>
                  </div><div>
                    <div className="text-white font-semibold">Email:</div>
                    <div className="bg-gray-200 p-2 rounded-md">{details.email}</div>
                  </div><div>
                    <div className="text-white font-semibold">Student Number:</div>
                    <div className="bg-gray-200 p-2 rounded-md">{details.studentNum}</div>
                  </div>

                  <div className="mt-4">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                  onClick={() => handleEditDetails(details)}>
                    Edit Details
                  </button>

                  </div>
                  </div>
                  
                ))}
              </div>
              
               {/* Modal to Handle Adding or Updating */} 
              <div>
                { profileModalState && (
                <ProfileEditModal 
                setModalState={handleModalClose} // Use handleModalClose to refresh decks after closing the modal
                initialDetails={currentDetails}
                userID={currentDetails?.id}
                />
                )}
              </div>

              </div>
            </div>
          </div>
    );
  }


Profile.requireAuth = true;
