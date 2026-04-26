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
import UserProfile from './page/UserProfile.jsx'
import DiscussionPage from './page/DiscussionPage.jsx'
import LibraryPage from './page/LibraryPage.jsx'
import SubmissionDetailPage from './page/SubmissionDetailPage.jsx'
import ProblemsPage from './page/ProblemsPage.jsx'
import ProblemDiscussionPage from './page/ProblemDiscussionPage.jsx'
import EditProblemPage from './page/EditProblemPage.jsx'
import { useThemeStore } from './store/useThemeStore.js'
import ContestPage from './page/ContestPage.jsx'
import ContestDetailPage from './page/ContestDetailPage.jsx'
import LeaderboardPage from './page/LeaderboardPage.jsx'
import DashboardPage from './page/DashboardPage.jsx'
import DiscussionThreadPage from './page/DiscussionThreadPage.jsx'
const App = () => {

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  if (isCheckingAuth && !authUser) {
    return (
      <div className='min-h-screen grid place-items-center bg-base-200'>
        <Loader className='h-14 w-14 animate-spin text-primary' />

      </div>
    )
  }
  return (
    <div className='min-h-screen w-full bg-base-200 text-base-content'>
      <Toaster />
      <Routes>

        <Route path='/' element={<Layout />} >
          <Route index element={authUser ? <HomePage /> : <Navigate to={'/login'} />} />
          <Route path='problems' element={authUser ? <ProblemsPage /> : <Navigate to={'/login'} />} />
          <Route path='discussion' element={authUser ? <DiscussionPage /> : <Navigate to={'/login'} />} />
          <Route path='library' element={authUser ? <LibraryPage /> : <Navigate to={'/login'} />} />
          <Route path='contest' element={authUser ? <ContestPage /> : <Navigate to={'/login'} />} />
          <Route path='discussion/problem/:problemId' element={authUser ? <ProblemDiscussionPage /> : <Navigate to={'/login'} />} />
          <Route path='contest/:id' element={authUser ? <ContestDetailPage /> : <Navigate to={'/login'} />} />
          <Route path='leaderboard' element={authUser ? <LeaderboardPage /> : <Navigate to={'/login'} />} />
          <Route path='dashboard' element={authUser ? <DashboardPage /> : <Navigate to={'/login'} />} />
          <Route path='discussion/thread/:id' element={authUser ? <DiscussionThreadPage /> : <Navigate to={'/login'} />} />
        </Route>

        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />

        <Route element={<AdminRoute />} >
          <Route
            path="/add-problem"
            element={authUser ? <AddProblem /> : <Navigate to="/login" />}
          />
          <Route
            path="/problem/:id/edit"
            element={authUser ? <EditProblemPage /> : <Navigate to="/login" />}
          />
        </Route>
        <Route path='/problem/:id' element={authUser ? <ProblemPage /> : <Navigate to="/login" />} />
        <Route path='/profile/:id' element={authUser ? <UserProfile /> : <Navigate to="/login" />} />
        <Route path='/submission/:submissionId' element={authUser ? <SubmissionDetailPage /> : <Navigate to="/login" />} />

      </Routes>
    </div>
  )
}

export default App