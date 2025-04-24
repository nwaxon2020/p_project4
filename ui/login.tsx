"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig/firebase";
import { FirebaseError } from "firebase/app";

export default function LoginUi() {
    const router = useRouter();
    
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setloading] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmitLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                // sign out to prevent partial login                  
                await signOut(auth);
                throw new Error("Please verify your email before logging in.");
            }

            // ✅ Now we know the email is verified

            const userInfo = localStorage.getItem("userInfo");
        
            if (userInfo) {
                const data = JSON.parse(userInfo);
                console.log("DATA NOW", data)
                // Save to Firestore if not saved already (you might want to handle duplicates)
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    gender: data.gender,
                    profileImage: data.profileImage,
                    createdAt: new Date(),
                });

                localStorage.removeItem("userInfo"); // cleanup
            }

            setSuccess("Login successful ✔");
            setTimeout(() => {
                router.push("/"); // or any route
            }, 2000);

        } catch (error: unknown) {
            
            // First, check if it's a Firebase error
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case "auth/invalid-credential":
                        setError("User not found...please ");
                        break;
                    case "auth/wrong-password":
                        setError("Incorrect password.");
                        break;
                    case "auth/weak-password":
                        setError("Password is too weak");
                        break;
                    default:
                        setError("Login failed.");
                }
            }
        
            // Then check for custom app errors like the "Please verify" message
            else if (error instanceof Error) {
                if (error.message === "Please verify your email before logging in.") {
                    setError(error.message);
                    return;
                }
        
                setError("Login failed.");
            }
        
            // Catch truly unknown errors
            else {
                setError("An unknown error occurred!");
            }
        }finally{
            setloading(false)
        }
        
    }

    return (
        <>
            {error && <p className="bg-red-700 text-center text-white p-2 font-bold">{error}{error==="User not found...please " && <Link className="text-blue-400 font-bold underline hover:text-blue-700" href={"/register"}>Sign Up</Link>} !!!</p>}
            {success && <p className="bg-white text-center text-black p-2 font-bold">{success}</p>}
            {error === "Please verify your email before logging in."?
            
                <div className="max-w-md h-[400px] sm:h-[300px] md:h-[300px] bg-gray-200 rounded-xl mx-auto my-15 flex flex-col justify-center align-center items-center">
                    <div><div className=" w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>...waiting...</div>
                    <p className="font-bold p-5 text-center text-xl">Please Verify Your Email To Continue...</p>
                    <small className="my-[-10] mx-5 text-center">A verification email was sent to your emil adress...If not found, please check email spam, if not found, then re-register</small>
                </div> :

                <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Log In</h1>
                    <form onSubmit={handleSubmitLogin} className="space-y-6">
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            onChange={handleChange}
                            value={formData.email}
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                placeholder="Password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                onChange={handleChange}
                                minLength={8}
                                value={formData.password}
                            />
                            <i
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-3 top-2 cursor-pointer fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                                style={{ fontSize: "20px", color: "gray" }}
                            />
                        </div>
                        { /* Submit Button */
                    
                            loading? <div className=" mx-auto w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div> :
                            <button 
                            type="submit"
                            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                Sign In
                            </button>
                
                        }

                    </form>
                    <div className="justify-center p-4 text-gray-800 text-l text-bold">Dont&apos;t have an account? <Link style={{color:"goldenrod",fontWeight:"bolder",textDecoration:"underline"}} href={"/register"}>Sign Up</Link></div>
                </div>
            }

        </>
    );
}
