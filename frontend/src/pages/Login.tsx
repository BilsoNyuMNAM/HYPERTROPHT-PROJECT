
import { useState } from "react"
import { Link } from 'react-router-dom'; 
import {Post} from "../service/centralisedApi.js"
export default function Login(){
    const [credentials, setCredentials]=useState({
        email:"",
        password:""
    })
    const [isLoading, setIsLoading]=useState(false);
    const [showPassword, setShowPassword] = useState(false)

    function handleInputChange(e:React.ChangeEvent<HTMLInputElement>){
        const {name, value} = e.target;
        setCredentials((prevCredentials)=>({
            ...prevCredentials,
            [name]: value
        }))
    }

    async function submitCredentials(){
        setIsLoading(true);
        try{
            const response = await Post("/mesoCycle/login", credentials)
            const data = await response.json();
            if(response.ok){
                localStorage.setItem("token", data.token)
                setIsLoading(false)
                window.location.href = "/Allmesocycle"
            }    
            else{
                setIsLoading(false)
                window.alert(data.message || "Login failed");
            }

        }catch(error){
            console.error("Error logging in:", error)
        }finally{
            setIsLoading(false)
        }
        
    }

    return(
        <div className="bg-black min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
 
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
                Welcome back
              </h2>
              <p className="text-gray-500 text-sm font-spaceMono mt-2">
                Log in to continue your training
              </p>
            </div>
 
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-5"
            >
              
              <div className="relative">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-spaceMono text-gray-500 mb-1.5 uppercase tracking-wider"
                >
                  Email
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
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={handleInputChange}
                    className="w-full bg-[#141414] text-white placeholder-gray-600 rounded-xl px-11 py-3 text-sm font-dmSans outline-none transition-colors duration-200"
                  />
                </div>
              </div>
 
              
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-spaceMono text-gray-500 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  
                </div>
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
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>

                  <input
                    id="login-password"
                    name="password"   
                    placeholder="Your password"
                    className="w-full bg-[#141414] text-white placeholder-gray-600 rounded-xl px-11 py-3 text-sm font-dmSans outline-none transition-colors duration-200 pr-11"
                    onChange={handleInputChange}
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
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

              </div>
 
              
              <button type="submit" 
                className="cursor-pointer w-full py-3.5 rounded-xl text-white font-dmSans font-semibold text-sm tracking-wide transition-all duration-300 relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                onClick={submitCredentials}
              >
                <span className="relative z-10">
                  {isLoading ? "Logging in…" : "Log In"}
                </span>

                <div className="absolute inset-0 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #E8511B 0%, #c73d1f 100%)",
                  }}
                />
              </button>


            </form>

            
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#1D1F22]" />
              <span className="text-xs font-spaceMono text-gray-600 uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-[#1D1F22]" />
            </div>
                

            <p className="text-center text-sm font-dmSans text-gray-500">
              New here?{" "}
              <Link
                to="/signup"
                className="text-[#F25E3D] hover:text-[#E8511B] transition-colors duration-200 font-semibold"
              >
                Create an account
              </Link>
              
            </p>
            
            
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
    )
}


