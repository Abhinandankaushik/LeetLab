import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set) => ({
<<<<<<< HEAD
    isSubmissionLoading: null,
    submissions: [],
    submission: null,
=======
    isSubmissionLoading: false,
    submissions: [],
    submission: null,
    submissionDetails: null,
>>>>>>> fabcf1d (added homepage,dashboard)
    submissionCount: null,


    getAllSubmissions: async () => {

        try {
            set({ isSubmissionLoading: true });

            const res = await axiosInstance.get('/submissions/get-all-submissions');
            set({ submissions: res.data.submission });
<<<<<<< HEAD
            toast.success("res.data.message");
=======
            toast.success(res.data.message);
>>>>>>> fabcf1d (added homepage,dashboard)

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
<<<<<<< HEAD
             set({ submissionCount: res.data.count });
             toast.success(res.data.message);
=======
            set({ submissionCount: res.data.count });
            toast.success(res.data.message);
>>>>>>> fabcf1d (added homepage,dashboard)
        } catch (error) {

            console.log("Error getting submissions", error);
            toast.error("Error getting submissions");
        }
<<<<<<< HEAD
    }
=======
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
>>>>>>> fabcf1d (added homepage,dashboard)

}));