"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig/firebase"
import { FirebaseError } from "firebase/app";
import axios, { AxiosError } from "axios";

export default function RegisterUi(){
    //router URL
    const router = useRouter()

    //flash messages & loading
    const [success, setSucess] = useState("")
    const [error, setError] = useState("")
    const [loading, setloading] = useState(false)

    //set image url controller
    const [imageSetter, setImageSetter] = useState <File | null> (null)

    //Max Imgae size to upload
    const maxSize = 10 * 1024 * 1024

    //show password variable and control
    const [showPassword, setShowPassword] = useState(false);

    //form data and Profile-image setter
    const [showProfileImge, setShowProfileImage] = useState("")
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        gender: "",
        profileImage: ""
    })

    //pass uer info
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>){
        const {name, value} = e.target;
        setFormData((prev)=>({...prev, [name]: value}))
    }

    //image handler for profile-image
    async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {

        const file = e.target.files?.[0];
        setImageSetter(file as File)

        if (!file || file.size > maxSize) {
            setError("Image Too Large..Image can not be more than 10MB");
            setTimeout(() => setError(""), 5000);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setShowProfileImage(objectUrl);
     
    }
    

    async function handleSubmiteReg(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log("User:", formData);

        setloading(true)
        setError("")
        setSucess("")

        let cloudinaryImage = ""

        try {

            if(imageSetter){
 
                const {data} = await axios.post("/api/cloudinary_api")
                const {timestamp, signature, api_key} = data

                const upladImg = new FormData()
                upladImg.append("file", imageSetter)
                upladImg.append("timestamp", timestamp)
                upladImg.append("signature", signature)
                upladImg.append("api_key", api_key)
            
                const res = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`, upladImg)
                cloudinaryImage = res.data.secure_url
            }

            
    
            // 2. Create auth user
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            localStorage.setItem("userInfo", JSON.stringify({...formData, profileImage:cloudinaryImage}))
    
            //const verification = process.env.NODE_ENV === "production"? process.env.NEXT_PUBLIC_URL as string  : "http://localhost:3000/login"
            // Send Email Verification
            await sendEmailVerification(user, {
                url: "http://localhost:3000/login",
                handleCodeInApp: false
            });

            setFormData({firstName:"",lastName:"",email:"",password:"",profileImage:"",gender:""})
            setSucess("A verification Email has been sent to your email address..Please complete verification to signUp");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
    
        } catch (error: unknown) {
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case "auth/email-already-in-use":
                        setError("Email already in use");
                        break;
                    case "auth/invalid-email":
                        setError("Invalid email address");
                        break;
                    case "auth/weak-password":
                        setError("Password is too weak");
                        break;
                    default:
                        setError("Something went wrong");
                }
            }else if (error instanceof AxiosError && error.response){
                setError(error.response.data.error || "An unknown error occurred");
                setTimeout(() => {
                    setError("");
                }, 6000);
            }
        }finally{
            setloading(false)
        }
    }
    

    return(
        <div>
            {error && <p className="bg-red-700 text-center text-white p-2 font-bold">{error}</p>}
            {success && <p className="bg-white text-center text-black p-2 font-bold">{success}</p>}

            <div className="max-w-md mx-auto my-5 p-6 bg-white rounded-lg shadow-md">
            
                <form onSubmit={handleSubmiteReg} method="POST" className="space-y-6">
                    {/* Image Upload Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <label className="cursor-pointer">
                            <div className="relative w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors group">
                                {/* Preview Image (hidden by default) */}
                                <img 
                                    src={showProfileImge || "./profileMe.png"}
                                    alt={formData.firstName}
                                    className={`absolute z-20 inset-0 w-full h-full object-cover ${!showProfileImge && "hidden"}`}
                                    id="preview" 
                                />
                            
                                {/* Default Upload Content - centered in the circle */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                    <svg 
                                    className="w-10 h-10 mb-2" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                    />
                                    </svg>
                                    <span className="text-xs font-medium">Click to upload</span>
                                </div>
                            
                                {/* Hidden File Input */}
                                <input 
                                    type="file" 
                                    name="profileImage"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </label>               
                        <div className="text-xs text-gray-500">
                            JPG, PNG up to 10MB
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <input 
                            type="text" 
                            name="firstName" 
                            required 
                            placeholder="First Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            onChange={handleChange}
                            value={formData.firstName}
                            />
                        </div>
                        <div>
                            <input 
                            type="text" 
                            name="lastName" 
                            required 
                            placeholder="Last Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            onChange={handleChange}
                            value={formData.lastName}
                            />
                        </div>
                    </div>

                    {/* Gender Select */}
                    <div>
                        <select 
                            name="gender"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                            onChange={handleChange}
                            value={formData.gender}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {/* Email Field */}
                    <div>
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            placeholder="Email@"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            onChange={handleChange}
                            value={formData.email}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}  
                            name="password" 
                            required 
                            minLength={8}
                            placeholder="Password (min 8 characters)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            onChange={handleChange}
                            value={formData.password}
                        />
                        <i
                            className={`absolute right-3 top-2 cursor-pointer fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                            style={{ fontSize: "20px", color:"gray" }}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>

                    { /* Submit Button */
                    
                        loading? <div className=" mx-auto w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div> :
                        <button 
                        type="submit"
                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Sign Up
                        </button>
                    
                    }

                </form>
                <div className="justify-center p-4 text-gray-800 text-l text-bold">Already have an account? <Link style={{color:"goldenrod",fontWeight:"bolder",textDecoration:"underline"}} href={"/login"}>Sign In</Link></div>
            </div>
            
        </div>

    )
}