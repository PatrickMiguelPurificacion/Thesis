import { UserDetails } from '@/types/user-details';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchUserDetails = async (userEmail: string) => {

    updateLastActive(userEmail); // Updates the active status of user when they access the app

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

export const updateLastActive = async (userEmail: string) => {

  // Gets the current user
  const found = query(collection(db, 'users'), where('email', '==', userEmail));
  const snapshot = await getDocs(found);

  if (snapshot.docs.length > 0) {
    let nu = {...snapshot.docs[0].data()};

    // Update the 'lastActive' to date today and time
    nu.lastActive = new Date();

    // Retrieve the 'recentActiveDays' array or initialize it if it doesn't exist
    let recent = nu.recentActiveDays || [];
    
    // Checks and adds entry in 'recentActiveDays' array if the recent entry is not for today and the array is not empty
    if (recent.length > 0) {
      let latest = new Date(recent[recent.length - 1].seconds * 1000);
      let now = new Date();

      if (latest.getFullYear() != now.getFullYear() || latest.getMonth() != now.getMonth() || latest.getDate() != now.getDate()) {
        recent.push(now);
      }
    } else {
      // If the array is empty, then add the date today
      recent.push(new Date());
    }

    // Limits 'recentActiveDays' array to 10 entries only
    if (recent.length > 10) recent.shift(); // Remove oldest entry if array length is more than 10
    nu.recentActiveDays = recent;

    await setDoc(doc(db, 'users', snapshot.docs[0].id), nu);
  }
}
