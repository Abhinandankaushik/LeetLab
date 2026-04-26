import React from "react"
import { User, Code, LogOut, MessageCircleMore, LibraryBig, House, Swords, Sun, Moon, Trophy, BarChart3, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import avtar from "../assets/react.svg"; // Placeholder for user avatar
import { useThemeStore } from "../store/useThemeStore";


const Navbar = () => {

    const { authUser } = useAuthStore()
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
                        Leetlab
                    </span>
                </Link>

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
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar flex flex-row ">
                            <div className="w-10 rounded-full ">
                                <img
                                    src={authUser?.image || avtar}
                                    alt="User Avatar"
                                    className="object-cover"
                                />
                            </div>

                        </label>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 z-10 w-52 space-y-3 rounded-box bg-base-100 p-2 shadow"
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