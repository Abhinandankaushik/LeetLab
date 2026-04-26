import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set) => ({
    isSubmissionLoading: false,
    submissions: [],
    submission: null,
    submissionDetails: null,
    submissionCount: null,


    getAllSubmissions: async () => {

        try {
            set({ isSubmissionLoading: true });

            const res = await axiosInstance.get('/submissions/get-all-submissions');
            set({ submissions: res.data.submission });
            toast.success(res.data.message);

        } catch (error) {

            console.log("Error getting submissions", error);
            toast.error("Error getting submissions");

        } finally {
            set({ isSubmissionLoading: false });
        }
    },

    getSubmissionForProblem: async (problemId) => {
        try {

            const res = await axiosInstance.get(`/submissions/get-submissions/${problemId}`);
            set({ submission: res.data.submission });
            toast.success(res.data.message);
        } catch (error) {
            console.log("Error getting submissions :", error);
            toast.error("Error getting submissions");
        }
    },

    getSubmissionCountForProblem: async (problemId) => {
        try {
            const res = await axiosInstance.get(`/submissions/get-submissions-count/${problemId}`);
            set({ submissionCount: res.data.count });
            toast.success(res.data.message);
        } catch (error) {

            console.log("Error getting submissions", error);
            toast.error("Error getting submissions");
        }
    },

    getSubmissionDetailsById: async (submissionId) => {
        try {
            set({ isSubmissionLoading: true });
            const res = await axiosInstance.get(`/submissions/get-submission/${submissionId}`);
            set({ submissionDetails: res.data.submission });
        } catch (error) {
            console.log("Error getting submission details", error);
            toast.error("Error getting submission details");
        } finally {
            set({ isSubmissionLoading: false });
        }
    },

    clearSubmissionDetails: () => set({ submissionDetails: null }),

}));