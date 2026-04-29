import React from "react"
<<<<<<< HEAD
import { User, Code, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import avtar from "../assets/react.svg"; // Placeholder for user avatar
=======
import { User, Code, LogOut, MessageCircleMore, LibraryBig, House, Swords, Sun, Moon, Trophy, BarChart3, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import avtar from "../assets/react.svg"; // Placeholder for user avatar
import { useThemeStore } from "../store/useThemeStore";
>>>>>>> fabcf1d (added homepage,dashboard)


const Navbar = () => {

    const { authUser } = useAuthStore()
<<<<<<< HEAD

    console.log("AUTH_USER", authUser)

    return (
        <nav className="sticky top-0 z-50 w-full py-5">
            <div className="flex w-full justify-between mx-auto max-w-4xl bg-black/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-200/10 p-4 rounded-2xl">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 cursor-pointer">
                    <img src="https://images.icon-icons.com/2389/PNG/512/leetcode_logo_icon_145113.png" className="h-18 w-18 bg-primary/20 text-primary border-none px-2 py-2 rounded-full" />
                    <span className="text-lg md:text-2xl font-bold tracking-tight text-white hidden md:block">
=======
    const { theme, toggleTheme } = useThemeStore()

    const navClassName = ({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-primary text-primary-content" : "text-base-content/75 hover:bg-base-200"}`;

    return (
        <nav className="sticky top-0 z-50 w-full px-4 pt-4">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-3xl border border-base-300 bg-base-100/85 p-4 shadow-xl backdrop-blur">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 cursor-pointer">
                    <img src="https://images.icon-icons.com/2389/PNG/512/leetcode_logo_icon_145113.png" alt="LeetLab" className="h-12 w-12 rounded-full bg-primary/10 p-1.5" />
                    <span className="hidden text-lg font-black tracking-tight md:block md:text-2xl">
>>>>>>> fabcf1d (added homepage,dashboard)
                        Leetlab
                    </span>
                </Link>

<<<<<<< HEAD
                {/* User Profile and Dropdown */}
                <div className="flex items-center gap-8">
=======
                <div className="hidden items-center gap-1 rounded-2xl border border-base-300 bg-base-100 p-1 md:flex">
                    <NavLink to="/" className={navClassName} end>
                        <span className="inline-flex items-center gap-2"><House className="h-4 w-4" />Home</span>
                    </NavLink>
                    <NavLink to="/problems" className={navClassName}>
                        <span className="inline-flex items-center gap-2"><Swords className="h-4 w-4" />Problems</span>
                    </NavLink>
                    <NavLink to="/discussion" className={navClassName}>
                        <span className="inline-flex items-center gap-2"><MessageCircleMore className="h-4 w-4" />Discussion</span>
                    </NavLink>
                    <NavLink to="/contest" className={navClassName}>
                        <span className="inline-flex items-center gap-2"><Trophy className="h-4 w-4" />Contest</span>
                    </NavLink>
                    <NavLink to="/leaderboard" className={navClassName}>
                        <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4" />Leaderboard</span>
                    </NavLink>
                    <NavLink to="/library" className={navClassName}>
                        <span className="inline-flex items-center gap-2"><LibraryBig className="h-4 w-4" />Library</span>
                    </NavLink>
                </div>

                {/* User Profile and Dropdown */}
                <div className="flex items-center gap-3">
                    <button type="button" className="btn btn-ghost btn-circle border border-base-300" onClick={toggleTheme}>
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
>>>>>>> fabcf1d (added homepage,dashboard)
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar flex flex-row ">
                            <div className="w-10 rounded-full ">
                                <img
<<<<<<< HEAD
                                    src={avtar }
=======
                                    src={authUser?.image || avtar}
>>>>>>> fabcf1d (added homepage,dashboard)
                                    alt="User Avatar"
                                    className="object-cover"
                                />
                            </div>

                        </label>
                        <ul
                            tabIndex={0}
<<<<<<< HEAD
                            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 space-y-3"
=======
                            className="menu menu-sm dropdown-content mt-3 z-10 w-52 space-y-3 rounded-box bg-base-100 p-2 shadow"
>>>>>>> fabcf1d (added homepage,dashboard)
                        >
                            {/* Admin Option */}


                            {/* Common Options */}
                            <li>
                                <p className="text-base font-semibold">

                                    {authUser?.name}

                                </p>
                                <hr className="border-gray-200/10" />
                            </li>
                            <li>
                                <Link
<<<<<<< HEAD
                                    to="/profile"
=======
                                    to="/dashboard"
                                    className="hover:bg-primary hover:text-white text-base font-semibold"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                 to={`/profile/${authUser?.id}`}
>>>>>>> fabcf1d (added homepage,dashboard)
                                    className="hover:bg-primary hover:text-white text-base font-semibold"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    My Profile
                                </Link>
                            </li>
                            {authUser?.role === "ADMIN" && (
                                <li>
                                    <Link
                                        to="/add-problem"
                                        className="hover:bg-primary hover:text-white text-base font-semibold"
                                    >
                                        <Code className="w-4 h-4 mr-1" />
                                        Add Problem
                                    </Link>
                                </li>
                            )}
                            <li>
                                <LogoutButton className="hover:bg-primary hover:text-white">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </LogoutButton>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
}


export default Navbar;