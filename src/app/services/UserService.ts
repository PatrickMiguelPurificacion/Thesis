import { collection, doc, getDoc, getDocs, query, setDoc, where} from 'firebase/firestore';
import { db } from '../firebase';

interface UserDetails {
  firstname: string;
  lastname: string;
  studentNum: number;
  email: string;
  uid: string;
  admin: boolean;
}

export const fetchUserDetails = async (userEmail: string) => {
    const q = query(collection(db, 'users'), where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const updateUserDetails = async (userID: string, user: UserDetails) => {
    try{
    await setDoc(doc(db, 'users', userID), user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };