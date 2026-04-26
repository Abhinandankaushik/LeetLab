import { axiosInstance } from "../lib/axios";
import { create } from "zustand";
import { toast } from "react-hot-toast";
export const useProblemStore = create((set) => ({

    problems: [],
    problem: null,
    solvedProblems: [],
    isProblemLoading: false,
    isProlemsLoading: false,

    getAllProblem: async () => {
        try {
            set({ isProlemsLoading: true });
            const res = await axiosInstance.get('/problems/get-all-problems');
            set({ problems : res.data.problems});
        } catch (error) {
            console.log("Error getting all problems :", error);
            toast.error("Error getting all problems");
        } finally {
            set({ isProlemsLoading: false });
        }
    },

    getProblemById: async (id) => {
        try {
            set({ isProblemLoading: true });
            const res = await axiosInstance.get(`/problems/get-problem/${id}`);
            set({ problem : res.data.problem });
        } catch (error) {
            console.log("Error getting problem by id :", error);
            toast.error("Error getting problem by id");
        } finally {
            set({ isProblemLoading: false });
        }
    },

    getSolvedProblemByUser: async () => { 
        set({ isProblemLoading: true });
        try {
            const res = await axiosInstance.get('/problems/get-solved-problems');
            const solvedProblems = res.data.problems;
            set({ solvedProblems });
        } catch (error) {
            console.log("Error getting solved problems by user :", error);
            toast.error("Error getting solved problems by user");
        } finally {
            set({ isProblemLoading: false });
        }
    },


}))
