import { UserDetails } from '@/types/user-details';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { updateUserDetails } from '../services/UserService';

interface Props {
  setModalState: (state: boolean) => void;
  initialDetails?: UserDetails;
  userID: string | null;
}

const ProfileEditModal = ({ setModalState, initialDetails, userID }: Props) => {

  const [userDetails, setUserDetails] = useState({
    firstname: initialDetails?.firstname || '',
    lastname: initialDetails?.lastname || '',
    studentNum: initialDetails?.studentNum || 0,
    email: initialDetails?.email || '',
    uid: initialDetails?.uid || '' ,
    admin: initialDetails?.admin || false,
  });

  useEffect(() => {
    // Update userDetails state when initialDetails change
    if (initialDetails) {
      setUserDetails({
        firstname: initialDetails.firstname,
        lastname: initialDetails.lastname,
        studentNum: initialDetails.studentNum,
        email: initialDetails.email,
        uid: initialDetails.uid,
        admin: false,
      });
    }
  }, [initialDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const saveDetails = async () => {
    try {
    if(userID){
        await updateUserDetails(userID, userDetails);
        toast.success('User details updated successfully!');
        setModalState(false);
    } else {
        toast.error('No User ID passed');
    }
    } catch (error: any) {
      toast.error('Error saving user details');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="relative bg-white shadow-md rounded p-8 m-4 w-full max-w-xl">
        <div className="mb-4">

            <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="hidden"
            value={userDetails.uid}
          />

          <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            id="firstname"
            name="firstname"
            value={userDetails.firstname}
            onChange={handleInputChange}
            placeholder="First Name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            id="lastname"
            name="lastname"
            value={userDetails.lastname}
            onChange={handleInputChange}
            placeholder="Last Name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="email" readOnly
            id="email"
            name="email"
            value={userDetails.email}
            placeholder="Email"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Student Number</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            id="studentNum"
            name="studentNum"
            value={userDetails.studentNum}
            onChange={handleInputChange}
            placeholder="Student Number"
            required
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setModalState(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            onClick={saveDetails}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
