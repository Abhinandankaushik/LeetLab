import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useDiscussionStore = create((set, get) => ({
  discussionStats: [],
  discussions: [],
  isDiscussionLoading: false,

  getDiscussionStats: async () => {
    try {
      set({ isDiscussionLoading: true });
      const res = await axiosInstance.get('/discussions/stats');
      set({ discussionStats: res.data.problems || [] });
    } catch (error) {
      console.log('Error fetching discussion stats', error);
      toast.error('Error fetching discussion stats');
    } finally {
      set({ isDiscussionLoading: false });
    }
  },

  getProblemDiscussions: async (problemId) => {
    try {
      set({ isDiscussionLoading: true });
      const res = await axiosInstance.get(`/discussions/problem/${problemId}`);
      set({ discussions: res.data.discussions || [] });
    } catch (error) {
      console.log('Error fetching discussions', error);
      toast.error('Error fetching discussions');
    } finally {
      set({ isDiscussionLoading: false });
    }
  },

  createDiscussion: async (problemId, payload) => {
    try {
      const res = await axiosInstance.post(`/discussions/problem/${problemId}`, payload);
      set({ discussions: [res.data.discussion, ...get().discussions] });
      toast.success('Discussion created');
    } catch (error) {
      console.log('Error creating discussion', error);
      toast.error('Error creating discussion');
    }
  },

  clearDiscussions: () => set({ discussions: [] }),
}));
