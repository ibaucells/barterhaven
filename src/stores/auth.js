//import { get } from 'node_modules/axios/index.cjs';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loggedIn: false,
    userId: null, // Store user ID when logged in
    user: null, // Store user object
  }),
  getters: {
    isAuthenticated: (state) => state.loggedIn, // Check if logged in
    getUserId: (state) => state.userId, // Get user ID
    getUsername: (state) => state.user?.username, // Get username
    getUserProfilePicture: (state) => state.user?.profilePicture, // Get profile picture
  },
  actions: {
    login(userId, userData) {
      this.loggedIn = true;
      this.userId = userId; // Store user ID
      this.user = userData; // Store user data
    },
    logout() {
      this.loggedIn = false;
      this.userId = null; // Clear user ID
      this.user = null; // Clear user data
    },
    updateUsername(newUsername) {
      if (this.user) {
        this.user.username = newUsername; // Update username in user object
      }
    }
  },
});
