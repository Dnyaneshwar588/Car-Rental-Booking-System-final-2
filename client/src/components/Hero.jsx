import React, { useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import {motion} from 'motion/react'

const Hero = () => {

    const [pickupLocation, setPickupLocation] = useState('')

    const {pickupDate, setPickupDate, returnDate, setReturnDate, navigate} = useAppContext()

    const handleSearch = (e)=>{
        e.preventDefault()
        navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate)
    }

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden bg-gradient-to-b from-[#FFF1D6] via-[#FFF8EC] to-[#F7FAF5]"
        >
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#FF8A1E]/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#0E7C3A]/15 blur-3xl" />

            <div className="max-w-6xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="inline-flex items-center gap-2 bg-white/80 border border-[#F1D7B5] px-4 py-2 rounded-full text-xs md:text-sm text-gray-700"
                    >
                        <span className="h-2 w-2 rounded-full bg-[#FF8A1E]" />
                        Premium cars across India • Verified owners • Instant booking
                    </motion.div>

                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1F2937] leading-tight"
                    >
                        Book premium cars for your next India trip in minutes
                    </motion.h1>

                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="text-gray-700 max-w-xl"
                    >
                        A premium booking experience with transparent pricing, flexible cancellation, and 24/7 support.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex items-center gap-1">
                            {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                    <img key={i} src={assets.star_icon} alt="rating" className="h-4" />
                                ))}
                        </div>
                        <span className="text-sm text-gray-700">4.9/5 average rating</span>
                    </motion.div>

                    <motion.form
                        initial={{ scale: 0.98, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.45 }}
                        onSubmit={handleSearch}
                        className="flex flex-col gap-4 bg-white/90 border border-[#F1D7B5] shadow-xl rounded-2xl p-5 md:p-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-600">Pickup Location</label>
                                <select
                                    required
                                    value={pickupLocation}
                                    onChange={(e) => setPickupLocation(e.target.value)}
                                    className="border border-[#E7C9A1] rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
                                >
                                    <option value="">Select city</option>
                                    {cityList.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="pickup-date" className="text-xs font-medium text-gray-600">
                                    Pick-up Date
                                </label>
                                <input
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    type="date"
                                    id="pickup-date"
                                    min={new Date().toISOString().split("T")[0]}
                                    className="border border-[#E7C9A1] rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="return-date" className="text-xs font-medium text-gray-600">
                                    Return Date
                                </label>
                                <input
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    type="date"
                                    id="return-date"
                                    className="border border-[#E7C9A1] rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FF8A1E] hover:bg-[#F16C00] text-white rounded-xl font-medium"
                        >
                            <img src={assets.search_icon} alt="search" className="brightness-300" />
                            Search availability
                        </motion.button>
                    </motion.form>
                </div>

                <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-[#FFB15C]/30 rounded-[32px] blur-2xl" />
                    <motion.img
                        src={assets.main_car}
                        alt="car"
                        animate={{ x: [0, 18, 0], y: [0, -4, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-full max-h-96 object-contain drop-shadow-2xl"
                    />
                    <motion.div
                        aria-hidden
                        className="absolute bottom-14 left-8 h-1.5 w-24 rounded-full bg-gray-500/30"
                        animate={{ x: [-10, 200] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        aria-hidden
                        className="absolute bottom-10 left-20 h-1.5 w-20 rounded-full bg-gray-500/20"
                        animate={{ x: [-20, 190] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.2 }}
                    />
                    <div className="absolute bottom-6 left-6 z-20 bg-white/90 border border-[#F1D7B5] rounded-xl px-4 py-3 shadow-lg">
                        <p className="text-xs text-gray-500">Trusted by</p>
                        <p className="text-sm font-semibold text-gray-900">12,000+ travelers across India</p>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    )
}

export default Hero
