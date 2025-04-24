"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig/firebase";

export default function HomeUi() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")

    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<{firstName:string, lastName: string, gender: string, profileImage: string} | null>(null)

    

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async(user) => {
        if (user) {
          setUser(user);
          setLoading(true);

          const userInfo = doc(db, "users", user.uid)
          const useInfo = await getDoc(userInfo)

          if(useInfo.exists()){
            setUserData(useInfo.data() as {firstName:string, lastName: string, gender: string, profileImage: string})
            setLoading(false)
          }
          else{
            setError("Error Loading Profile Please Try Again....")
          }
          

        } else {
          setLoading(true);
          router.push("/login"); // Redirect to login if the user is not authenticated
        }
      });
  
      return () => unsubscribe(); // Cleanup on unmount
    }, []);
  
    if (loading) return (<div className="w-full h-screen flex items-center justify-center bg-transparent">
    <div className="w-30 h-30 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
  </div>)
  


  return (
    <div className="flex justify-center flex-col items-center w-full max-w-[1000px] sm:w-[250px] md:w-[300px] lg:w-[1000px] h-[120px] sm:h-[150px] md:h-[150px] lg:h-[600px] bg-white mx-auto my-[-2rem] rounded-xl">
        {error && <p className="bg-red-700 text-center text-white p-2 font-bold">{error}</p>}
        <h1>WELCOME HOME {user?.email}</h1>
        <div className="flex flex-col items-center bg-gray-300">
            <img className="w-20 h-20 rounded-full border-3 border-red-300" src={userData?.profileImage || "./profileMe.png"} alt="" />
            <h2>Name: {userData?.firstName} {userData?.lastName}</h2>
            <h3>Gender: {userData?.gender}</h3>
        </div>
        <button type="submit" className="rounded-xl bg-red-800 text-white mx-auto my-10 p-5 hover:bg-red-600" onClick={()=> {setLoading(true); signOut(auth); setLoading(false)}}>Log Out</button>
    </div>
  )
}