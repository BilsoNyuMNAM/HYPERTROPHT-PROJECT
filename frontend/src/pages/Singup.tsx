import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {z} from "zod";
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { Post } from "../service/centralisedApi.js"

const Signupschema = z.object({
  username: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address").endsWith("@gmail.com", "Invalid email address"),
  confirmPassword: z.string()
}).refine(function confirmPassword(data){
  return data.password === data.confirmPassword
}, {message:"Incorrect password", path:["confirmPassword"]})

export default function Signup() {
   const {register, handleSubmit, formState} = useForm({
    resolver: zodResolver(Signupschema)
  });
  
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  

  async function Submit(data:any){
    setIsLoading(true)
    try{
      const result = await Post("/mesoCycle/signup", data);
      const responseData = await result.json()
      if(result.ok){
        localStorage.setItem("token", responseData.token)
        window.alert("Signup successful! You can now log in.")
        setIsLoading(false)
        navigate("/Allmesocycle")
      }
      else{
        window.alert(responseData.error || "Signup failed. Please try again.")
        setIsLoading(false)
      }
    }
    catch(error){
      window.alert("Signup failed. Please try again.")
      setIsLoading(false);
    }

  }
 



  return (
    <div className="bg-black min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
    
      <div
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(242,94,61,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(217,73,41,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <h1 className="text-3xl font-bebas text-white tracking-wider group-hover:text-[#F25E3D] transition-colors duration-300">
              HYPERTROPHY
            </h1>
          </Link>
          <p className="text-gray-500 text-sm font-spaceMono mt-1">
            Volume that regulates itself
          </p>
        </div>
        
        <div
          className="rounded-2xl p-[1px] relative"
          style={{
            background:
              "linear-gradient(135deg, rgba(242,94,61,0.3) 0%, rgba(29,31,34,0.8) 40%, rgba(29,31,34,0.8) 60%, rgba(242,94,61,0.15) 100%)",
          }}
        >
          <div className="bg-[#0C0C0C] rounded-2xl p-8">
           
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white font-barlow tracking-wide">
                Create your account
              </h2>
              <p className="text-gray-500 text-sm font-spaceMono mt-2">
                Start training smarter today
              </p>
            </div>
            
            <form
              onSubmit={handleSubmit(Submit)}
              className="space-y-5"
            >
            
              <div className="relative">
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-spaceMono text-gray-500 mb-1.5 uppercase tracking-wider"
                >
                  Full Name
                </label>
                <div
                  className="relative rounded-xl transition-all duration-300"
                  style={{
                    boxShadow:
                      focusedField === "name"
                        ? "0 0 0 1px #F25E3D, 0 0 20px rgba(242,94,61,0.1)"
                        : "0 0 0 1px #1D1F22",
                  }}
                >
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="signup-name"
                    {...register("username")}
                    type="text"
                    placeholder="Your name"
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#141414] text-white placeholder-gray-600 rounded-xl px-11 py-3 text-sm font-dmSans outline-none transition-colors duration-200"
                  />
                </div>
                {formState.errors.username && (
                  <p className="text-xs text-red-500 font-spaceMono mt-1.5">
                    {formState.errors.username.message}
                  </p>
                )}
              </div>
             
              <div className="relative">
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-spaceMono text-gray-500 mb-1.5 uppercase tracking-wider"
                >
                  Email
                </label>
                <div
                  className="relative rounded-xl transition-all duration-300"
                  style={{
                    boxShadow:
                      focusedField === "email"
                        ? "0 0 0 1px #F25E3D, 0 0 20px rgba(242,94,61,0.1)"
                        : "0 0 0 1px #1D1F22",
                  }}
                >
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    id="signup-email"
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#141414] text-white placeholder-gray-600 rounded-xl px-11 py-3 text-sm font-dmSans outline-none transition-colors duration-200"
                  />
                </div>
                {formState.errors.email && (
                  <p className="text-xs text-red-500 font-spaceMono mt-1.5">
                    {formState.errors.email.message}
                  </p>
                )}
              </div>
              {/* Password */}
              <div className="relative">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-spaceMono text-gray-500 mb-1.5 uppercase tracking-wider"
                >
                  Password
                </label>
                <div
                  className="relative rounded-xl transition-all duration-300"
                  style={{
                    boxShadow:
                      focusedField === "password"
                        ? "0 0 0 1px #F25E3D, 0 0 20px rgba(242,94,61,0.1)"
                        : "0 0 0 1px #1D1F22",
                  }}
                >
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>

                  </div>
                  <input
                    id="signup-password"
                    {...register("password")}
                    
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#141414] text-white placeholder-gray-600 rounded-xl px-11 py-3 text-sm font-dmSans outline-none transition-colors duration-200 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {formState.errors.password && (
                  <p className="text-xs text-red-500 font-spaceMono mt-1.5">
                    {formState.errors.password.message}
                  </p>
                )}
                
              </div>
              {/* Confirm Password */}
              <div className="relative">
                <label
                  htmlFor="signup-confirm"
                  className="block text-xs font-spaceMono text-gray-500 mb-1.5 uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <div
                  className="relative rounded-xl transition-all duration-300"
                >
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <input
                    id="signup-confirm"
                    {...register("confirmPassword")}
                    
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#141414] text-white placeholder-gray-600 rounded-xl px-11 py-3 text-sm font-dmSans outline-none transition-colors duration-200 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {showConfirm ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-spaceMono mt-1.5">
                    {formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading} 
                className="w-full py-3.5 rounded-xl text-white font-dmSans font-semibold text-sm tracking-wide transition-all duration-300 relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                
                id="signup-submit"
              >
                <span className="relative z-10" >Create Account</span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, #E8511B 0%, #c73d1f 100%)",
                  }}
                />
              </button>
            </form> 
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <div
            className="h-1 w-16 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #F25E3D, transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}








