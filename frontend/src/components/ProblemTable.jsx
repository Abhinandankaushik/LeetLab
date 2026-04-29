<<<<<<< HEAD

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '../store/useAuthStore.js'
import { Link } from 'react-router-dom'
import { Bookmark, PencilIcon, Trash, TrashIcon, Plus, Loader2 } from 'lucide-react'
import { useAction } from '../store/useAction.js'
import { usePlaylistStore } from '../store/usePlaylistStore.js'
import CreatePlaylistModal from './CreatePlaylistModal.jsx'
import AddToPlaylistModal from './AddToPlaylistModal.jsx'

const ProblemTable = ({ problems }) => {

    const { authUser } = useAuthStore();

    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('ALL');
    const [selectedTags, setSelectedTags] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const { isDeletingProblem, onDeleteProblem } = useAction();

    const { createPlaylist } = usePlaylistStore()

    const [ isCreateModelOpen, setIsCreateModelOpen ] = useState(false)
    const [ isAddToPlaylistModelOpen, setIsAddToPlaylistModelOpen ] = useState(false)
    const [selectedProblemId, setSelectedProblemId] = useState(null)


    console.log(problems)
    // Extract all unique tags from problems
    const allTags = useMemo(() => {
        if (!Array.isArray(problems)) {
            return []
        }

        const tagSet = new Set();

        problems.forEach((problem) => {
            problem.tags?.forEach((tag) => {
                tagSet.add(tag);
            })
        })

        return Array.from(tagSet);
    }, [problems]);

    // Define allowed difficulties
    const difficultyOptions = ['EASY', 'MEDIUM', 'HARD'];

    console.log("problem : ", problems)

    const filteredProblem = useMemo(() => {
        return (problems)
            .filter((problem) =>
                problem.title.toLowerCase().includes(search.toLowerCase())
            )
            .filter((problem) =>
                difficulty === "ALL" ? true : problem.defficulty === difficulty
            )
            .filter((problem) =>
                selectedTags === "ALL" ? true : problem.tags?.includes(selectedTags)
            );
    }, [problems, search, difficulty, selectedTags]);

    // filteredProblem = filteredProblem.length > 0 ? filteredProblem : problems



    const itemPerPage = 5;
    const totalPage = Math.ceil(filteredProblem.length / itemPerPage);
    const paginatedProblem = useMemo(() => {
        return filteredProblem.slice((currentPage - 1) * itemPerPage,
            ((currentPage - 1) * itemPerPage + itemPerPage) > filteredProblem.length ?
                filteredProblem.length : ((currentPage - 1) * itemPerPage + itemPerPage));
    }, [filteredProblem, currentPage]);

    console.log("paginated", paginatedProblem)


   
    const handleDelete = (id) => {
        onDeleteProblem(id);
    }
    const handleCreatePlaylist = async (data) => {
        await createPlaylist(data);
    }

    const handleAddToPlaylist = async (problemId) => {
       setSelectedProblemId(problemId)
       setIsAddToPlaylistModelOpen(true)
    }

    return (
        <div className="w-full max-w-6xl mx-auto mt-10">

            {/* Header with Create Playlist Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Problems</h2>
                <button
                    className="btn btn-primary gap-2"
                    onClick={() => setIsCreateModelOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                    Create Playlist
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    placeholder="Search by title"
                    className="input input-bordered w-full md:w-1/3 bg-base-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="select select-bordered bg-base-200"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <option value="ALL">All Difficulties</option>
                    {difficultyOptions.map((diff) => (
                        <option key={diff} value={diff}>
                            {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
                        </option>
                    ))}
                </select>


                <select
                    className="select select-bordered bg-base-200"
                    value={selectedTags}
                    onChange={(e) => setSelectedTags(e.target.value)}
                >
                    <option value="ALL">All Tags</option>
                    {allTags.map((tag) => (
                        <option key={tag} value={tag}>
                            {tag}
                        </option>
                    ))}
                </select>

            </div>


            <div className='oveflow-x-auto rout rounded-xl shadow-md'>

                <table className='table table-zebra table-lg bg-base-200 text-base-content'>

                    <thead>
                        <tr>
                            <th>Solved</th>
                            <th>Title</th>
                            <th>Tags</th>
                            <th>Difficulty</th>
                            <th>Actions</th>
                        </tr>
                    </thead>


                    <tbody>
                        {paginatedProblem.length > 0 ? (
                            paginatedProblem.map((problem) => {
                                const isSolved = problem.solvedBy.some(
                                    (user) => user.userId === authUser?.id
                                );
                                return (
                                    <tr key={problem.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={isSolved}
                                                readOnly
                                                className="checkbox checkbox-sm"
                                            />
                                        </td>
                                        <td>
                                            <Link to={`/problem/${problem.id}`} className="font-semibold hover:underline">
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {(problem.tags || []).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="badge badge-outline badge-warning text-xs font-bold"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge font-semibold text-xs text-white ${problem.difficulty === "EASY"
                                                    ? "badge-success"
                                                    : problem.difficulty === "MEDIUM"
                                                        ? "badge-warning"
                                                        : "badge-error"
                                                    }`}
                                            >
                                                {problem.defficulty}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                                                {authUser?.role === "ADMIN" && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                         
                                                            onClick={() => handleDelete(problem.id)}
                                                            className="btn btn-sm btn-error"
                                                        >
                                                            {
                                                                isDeletingProblem ? <Loader2 className="animate-spin w-4 h-4 " /> :
                                                                    <TrashIcon className="w-4 h-4 text-white" />
                                                            }

                                                        </button>
                                                        <button disabled className="btn btn-sm btn-warning">
                                                            <PencilIcon className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline flex gap-2 items-center"
                                                    onClick={() => handleAddToPlaylist(problem.id)}
                                                >
                                                    <Bookmark className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Save to Playlist</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500">
                                    No problems found.
                                </td>
                            </tr>
                        )}

                    </tbody>

                </table>

                {/* {pagination logic} */}
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        className="btn btn-sm"
                        disabled={currentPage === 1 || totalPage === 0}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Prev
                    </button>
                    <span className="btn btn-ghost btn-sm">
                        {currentPage} / {totalPage}
                    </span>
                    <button
                        className="btn btn-sm"
                        disabled={currentPage === totalPage || totalPage === 0}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </button>
                </div>


            </div >


            {/* Modals */}
            <CreatePlaylistModal
                isOpen = {isCreateModelOpen}
                onClose={() => setIsCreateModelOpen(false)}
                onSubmit={handleCreatePlaylist}
            />

            <AddToPlaylistModal 
                isOpen={isAddToPlaylistModelOpen}
                onClose={() => setIsAddToPlaylistModelOpen(false)}
                problemId={selectedProblemId}
             
            />


        </div >
    )
}

export default ProblemTable
=======
import  { useState, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { Link } from 'react-router-dom';
import { Bookmark, PencilIcon, TrashIcon, Plus, Loader2 } from 'lucide-react';
import { useAction } from '../store/useAction.js';
import { usePlaylistStore } from '../store/usePlaylistStore.js';
import CreatePlaylistModal from './CreatePlaylistModal.jsx';
import AddToPlaylistModal from './AddToPlaylistModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const ProblemTable = ({ problems }) => {
  const { authUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [selectedTags, setSelectedTags] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const { isDeletingProblem, onDeleteProblem } = useAction();
  const { createPlaylist } = usePlaylistStore();
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [isAddToPlaylistModelOpen, setIsAddToPlaylistModelOpen] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  // Extract all unique tags from problems
  const allTags = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    const tagSet = new Set();
    problems.forEach((problem) => {
      problem.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [problems]);

  const difficultyOptions = ['EASY', 'MEDIUM', 'HARD'];

  const filteredProblem = useMemo(() => {
    return problems
      .filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((problem) =>
        difficulty === 'ALL' ? true : problem.defficulty === difficulty
      )
      .filter((problem) =>
        selectedTags === 'ALL' ? true : problem.tags?.includes(selectedTags)
      );
  }, [problems, search, difficulty, selectedTags]);

  const itemPerPage = 5;
  const totalPage = Math.ceil(filteredProblem.length / itemPerPage);
  const paginatedProblem = useMemo(() => {
    const start = (currentPage - 1) * itemPerPage;
    const end = start + itemPerPage;
    return filteredProblem.slice(start, end);
  }, [filteredProblem, currentPage]);

  const handleDelete = (id) => {
    onDeleteProblem(id);
  };

  const handleCreatePlaylist = async (data) => {
    await createPlaylist(data);
  };

  const handleAddToPlaylist = (problemId) => {
    setSelectedProblemId(problemId);
    setIsAddToPlaylistModelOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-12 px-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-gray-900 dark:text-gray-100"
        >
          Problems
        </motion.h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow"
          onClick={() => setIsCreateModelOpen(true)}
        >
          <Plus className="w-5 h-5" />
          New Playlist
        </motion.button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Search challenges..."
          className="w-full md:w-1/3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="ALL">All Difficulties</option>
          {difficultyOptions.map((diff) => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={selectedTags}
          onChange={(e) => setSelectedTags(e.target.value)}
        >
          <option value="ALL">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-800">
        <table className="w-full text-gray-900 dark:text-gray-100">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <th className="p-4 text-left">Solved</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Tags</th>
              <th className="p-4 text-left">Difficulty</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedProblem.length > 0 ? (
                paginatedProblem.map((problem) => {
                  const isSolved = problem.solvedBy.some(
                    (user) => user.userId === authUser?.id
                  );
                  return (
                    <motion.tr
                      key={problem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSolved}
                          readOnly
                          className="checkbox checkbox-sm border-blue-500 checked:bg-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/problem/${problem.id}`}
                          className="text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          {problem.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {(problem.tags || []).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-xs font-semibold px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            problem.defficulty === 'EASY'
                              ? 'bg-green-100 dark:bg-green-600 text-green-800 dark:text-green-100'
                              : problem.defficulty === 'MEDIUM'
                              ? 'bg-yellow-100 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-100'
                              : 'bg-red-100 dark:bg-red-600 text-red-800 dark:text-red-100'
                          }`}
                        >
                          {problem.defficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {authUser?.role === 'ADMIN' && (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(problem.id)}
                                className="p-2 bg-red-500 rounded-lg"
                              >
                                {isDeletingProblem ? (
                                  <Loader2 className="animate-spin w-4 h-4 text-white" />
                                ) : (
                                  <TrashIcon className="w-4 h-4 text-white" />
                                )}
                              </motion.button>
                              <Link to={`/problem/${problem.id}/edit`}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 bg-yellow-500 rounded-lg"
                                  type="button"
                                >
                                  <PencilIcon className="w-4 h-4 text-white" />
                                </motion.button>
                              </Link>
                            </div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddToPlaylist(problem.id)}
                            className="flex items-center gap-2 px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Bookmark className="w-4 h-4" />
                            <span className="hidden sm:inline">Save</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No challenges found.
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg disabled:opacity-50"
          disabled={currentPage === 1 || totalPage === 0}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </motion.button>
        <span className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg">
          {currentPage} / {totalPage}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg disabled:opacity-50"
          disabled={currentPage === totalPage || totalPage === 0}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </motion.button>
      </div>

      {/* Modals */}
      <CreatePlaylistModal
        isOpen={isCreateModelOpen}
        onClose={() => setIsCreateModelOpen(false)}
        onSubmit={handleCreatePlaylist}
      />
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModelOpen}
        onClose={() => setIsAddToPlaylistModelOpen(false)}
        problemId={selectedProblemId}
      />
    </div>
  );
};

export default ProblemTable;
>>>>>>> fabcf1d (added homepage,dashboard)
