import { Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'


import HomePage from './page/HomePage'
import LoginPage from './page/LoginPage'
import SignUpPage from './page/SignUpPage.jsx'
import { useAuthStore } from './store/useAuthStore.js'
import { useEffect } from 'react'
import { Loader } from 'lucide-react'
import Layout from './layout/Layout.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import AddProblem from './page/AddProblem.jsx'
import ProblemPage from './page/ProblemPage.jsx'
const App = () => {

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <Loader className='h-25 w-25 animate-spin text-blue-500' />

      </div>
    )
  }
  return (
    <div className='flex flex-col items-center justify-center '>
      <Toaster />
      <Routes>

        <Route path='/' element={<Layout />} >
          <Route index element={authUser ? <HomePage /> : <Navigate to={'/login'} />} />
        </Route>

        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />

        <Route element={<AdminRoute />} >
          <Route
            path="/add-problem"
            element={authUser ? <AddProblem /> : <Navigate to="/login" />}
          />
        </Route>
        <Route path='/problem/:id' element={authUser ? <ProblemPage /> : <Navigate to="/login" />} />

      </Routes>
    </div>
  )
}

export default App