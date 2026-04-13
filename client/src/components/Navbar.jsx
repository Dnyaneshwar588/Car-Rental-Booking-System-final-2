import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import {motion} from 'motion/react'

const Navbar = () => {

    const {user, logout, isOwner} = useAppContext()

    const location = useLocation()
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        const trimmedSearch = searchTerm.trim()

        if (!trimmedSearch) {
            navigate('/cars')
            return
        }

        navigate(`/cars?query=${encodeURIComponent(trimmedSearch)}`)
    }

  return (
    <motion.div 
    initial={{y: -20, opacity: 0}}
    animate={{y: 0, opacity: 1}}
    transition={{duration: 0.5}}
    className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor backdrop-blur-xl bg-white/80 transition-all ${location.pathname === "/" && "bg-white/70"}`}>

        <Link to='/'>
            <motion.img whileHover={{scale: 1.05}} src={assets.logo} alt="logo" className="h-8"/>
        </Link>

        <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}>
            {menuLinks.map((link, index)=> (
                <Link key={index} to={link.path}>
                    {link.name}
                </Link>
            ))}

            <form onSubmit={handleSearch} className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56 bg-white'>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                    placeholder="Search cars or locations"
                />
                <button type="submit" aria-label="Search cars or locations" className='cursor-pointer'>
                    <img src={assets.search_icon} alt="search" />
                </button>
            </form>

            <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
                {isOwner ? (
                    <button onClick={()=> navigate('/owner')} className="cursor-pointer px-5 py-2 rounded-lg border border-borderColor hover:bg-gray-50 transition">Dashboard</button>
                ) : !user ? (
                    <button onClick={()=> navigate('/owner/login')} className="cursor-pointer px-5 py-2 rounded-lg border border-borderColor hover:bg-gray-50 transition">List My Car</button>
                ) : null}

                <button onClick={()=> {user ? logout() : navigate('/login')}} className="cursor-pointer px-7 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg">{user ? 'Logout' : 'Login'}</button>
            </div>
        </div>

        <button className='sm:hidden cursor-pointer' aria-label="Menu" onClick={()=> setOpen(!open)}>
            <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
        </button>
      
    </motion.div>
  )
}

export default Navbar
