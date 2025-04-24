// firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
};

// Initialize Firebase (Only if it's not initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);


// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { auth, storage, db } from "./firebaseConfig";

// const handleRegister = async (email, password, username, imageFile) => {
//   try {
//     // 1. Upload image to storage
//     const imageRef = ref(storage, `users/${Date.now()}_${imageFile.name}`);
//     await uploadBytes(imageRef, imageFile);
//     const imageUrl = await getDownloadURL(imageRef);

//     // 2. Create auth user
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // 3. Store user data in Firestore
//     await setDoc(doc(db, "users", user.uid), {
//       uid: user.uid,
//       email,
//       username,
//       imageUrl,
//       createdAt: new Date()
//     });

//     console.log("User registered!");
//   } catch (error) {
//     console.error("Registration error:", error.message);
//   }
// };
