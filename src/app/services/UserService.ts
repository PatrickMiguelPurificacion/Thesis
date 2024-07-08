import { collection, doc, getDoc, getDocs, query, setDoc, where} from 'firebase/firestore';
import { db } from '../firebase';

interface UserDetails {
  firstname: string;
  lastname: string;
  studentNum: number;
  email: string;
  uid: string;
  admin: boolean;
  lastActive: Date;
  recentActiveDays: Date[];
}

export const fetchUserDetails = async (userEmail: string) => {
    updateLastActive(userEmail);

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
  const found = query(collection(db, 'users'), where('email', '==', userEmail));
  const snapshot = await getDocs(found);

  if (snapshot.docs.length > 0) {
    let nu = {...snapshot.docs[0].data()};
    nu.lastActive = new Date();

    let recent = nu.recentActiveDays || [];
    if (recent.length > 0) {
      let latest = new Date(recent[recent.length - 1].seconds * 1000);
      let now = new Date();

      if (latest.getFullYear() != now.getFullYear() || latest.getMonth() != now.getMonth() || latest.getDate() != now.getDate()) {
        recent.push(now);
      }
    } else {
      recent.push(new Date());
    }

    if (recent.length > 10) recent.shift();
    nu.recentActiveDays = recent;

    await setDoc(doc(db, 'users', snapshot.docs[0].id), nu);
  }
}
