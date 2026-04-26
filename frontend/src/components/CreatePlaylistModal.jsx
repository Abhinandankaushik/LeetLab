import React from 'react';
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CreatePlaylistModal = ({ isOpen, onClose, onSubmit }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const handleFormSubmit = async (data) => {
        await onSubmit(data);
        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-2xl font-bold text-white">Create New Playlist</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-6 h-6 text-white/80" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white/90">
                                    Playlist Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Enter playlist name"
                                    {...register('name', { required: 'Playlist name is required' })}
                                />
                                {errors.name && (
                                    <span className="text-sm text-red-400">{errors.name.message}</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white/90">
                                    Description
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none h-32"
                                    placeholder="Enter playlist description"
                                    {...register('description')}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    Create Playlist
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreatePlaylistModal;