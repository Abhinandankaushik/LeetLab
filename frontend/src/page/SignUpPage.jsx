// npm install react-hook-form zod @hookform/resolvers ?? for importing to validate react hool form with zod
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthImagePattern from '../components/AuthImagePattern'
import {useAuthStore} from '../store/useAuthStore.js'
import {
  Code,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react'



//wtih Zod validation
const SignUpPage = () => {

  const [showPassword, setShowPassword] = useState(false);
  const {signup , isSigninUp} = useAuthStore();
  
  const signUpSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }).max(20, { message: "Name must be at most 20 characters long" }),
    email: z.string().min(12, { message: "Email must be at least 12 characters long" }).email({ message: "Invalid email address" }),
    password: z.string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(20, { message: "Password must be at most 20 characters long" })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, { message: "Password must contain at least one letter and one number" }),
  });

const onSubmit = async (data) => {
   try{
      await signup(data);
      console.log("signup Data:", data);
   }catch(error){
      console.error("Error during signup:", error);
   }
  }


  const {
    register,
    handleSubmit,
    watch,
    formState: { errors},
  } = useForm({ resolver: zodResolver(signUpSchema) });


  return (
    <div className='h-screen grid lg:grid-cols-2'>
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome </h1>
              <p className="text-base-content/60">Sign Up to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Code className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  {...register("name")}
                  className={`input input-bordered w-full pl-10 ${errors.name ? "input-error" : ""
                    }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className={`input input-bordered w-full pl-10 ${errors.email ? "input-error" : ""
                    }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`input input-bordered w-full pl-10 ${errors.password ? "input-error" : ""
                    }`}
                  placeholder="••••••••"
                />

                
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigninUp}
            >
              {isSigninUp ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "SignUp"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
   

   <AuthImagePattern 
   title="Welcome to Our Platform"
   subtitle= {
      "Join us to explore the world of coding challenges and improve your skills."
   }
   />

    </div>
  )

}

export default SignUpPage










//without Zod validation
// const SignUpPage = () => {

//   const onSubmit = async (data) => {
//     await new Promise((resolve) => setTimeout(resolve, 2000))
//     console.log("Submmit Data:",data)

//   }

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors , isSubmitting},
//   } = useForm()

//   return (

//     <form onSubmit={handleSubmit(onSubmit)}>

//       <div>
//         <label htmlFor="firstName">FirstName:</label>
//         <input {...register("firstName", {
//           required: { value: true, message: "First name is required" },
//           minLength: { value: 2, message: "First name must be at least 2 characters long" },
//           maxLength: { value: 20, message: "First name must be at most 20 characters long" },
//           pattern: { value: /^[A-Za-z]+$/, message: "First name must contain only letters" },
//         })} />
//         {errors.firstName && <span>{errors.firstName.message}</span>}
//       </div>


//       <div>
//         <label htmlFor="lastName"> LastName:</label>
//         <input {...register("lastName", {
//           required: { value: true, message: "Last name is required" },
//           minLength: { value: 2, message: "Last name must be at least 2 characters long" },
//           maxLength: { value: 20, message: "Last name must be at most 20 characters long" },
//           pattern: { value: /^[A-Za-z]+$/, message: "Last name must contain only letters" },

//         })} />
//         {errors.lastName && <span>{errors.lastName.message}</span>}
//       </div>



//       <div>
//         <label htmlFor="email">Email:</label>
//         <input {...register("email", {
//           required: { value: true, message: "Email is required" },
//           pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" },
//         })} />
//         {errors.email && <span>{errors.email.message}</span>}
//       </div>


//       <div>
//         <label htmlFor="password"> Password:</label>
//         <input {...register("password", {
//           required: { value: true, message: "Password is required" },
//           minLength: { value: 6, message: "Password must be at least 6 characters long" },
//           maxLength: { value: 20, message: "Password must be at most 20 characters long" },
//           pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, message: "Password must contain at least one letter and one number" },
//         })} />
//         {errors.password && <span>{errors.password.message}</span>}
//       </div>

//       <input type="submit" disabled={isSubmitting} />

//     </form>
//   )
// }
