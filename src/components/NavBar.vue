<template>
  <v-app-bar 
    elevation="4"
    color="blue-darken-4"
    class="app-bar px-4"
  >
    <!-- Left: Logo -->
    <template v-slot:prepend>
      <v-icon 
        color="cyan-lighten-3" 
        icon="mdi-handshake-outline" 
        size="40"
        class="ml-3"
        aria-label="BarterHaven"
      />
    </template>

    <!-- Center: Brand Name (Clickable) -->
    <v-app-bar-title 
      @click="goHome" 
      class="page-title text-cyan-lighten-3 cursor-pointer"
    >
      BarterHaven
    </v-app-bar-title>

    <!-- Exchange Proposals Button -->
    <v-btn 
        v-if="authStore.loggedIn" 
        class="mr-3" 
        color="cyan-lighten-3"
        variant="tonal"
        @click="goToExchangeProposals"
      >
        <v-icon left>mdi-bell-outline</v-icon>
        Exchange Proposals
    </v-btn>

    <template v-slot:append>
      <!-- Add Item Button -->
      <v-btn 
        v-if="authStore.loggedIn" 
        class="mr-3" 
        color="cyan-lighten-3"
        variant="tonal"
        @click="goToAddItem"
      >
        <v-icon left>mdi-plus</v-icon>
        Add Item
    </v-btn>

      <!-- Profile Dropdown -->
      <v-menu v-if="authStore.loggedIn" transition="scale-transition" open-on-hover>
        <template v-slot:activator="{ props }">
          <v-avatar 
            v-bind="props" 
            class="cursor-pointer mr-4 profile-avatar"
            size="48"
          >
            <template v-if="authStore.user?.profilePicture">
              <img 
              :src="getProfileImageUrl(authStore.user?.profilePicture)" 
              alt="Profile Picture"  
              class="avatar-img" 
              style="object-fit: contain; width: 100%; height: 100%;" 
              />
            </template>
            <template v-else>
              <v-icon icon="mdi-account-circle" size="48" />
            </template>
          </v-avatar>
        </template>

        <!-- Profile Menu -->
        <v-list class="profile-menu">
            <v-list-item class="profile-header d-flex justify-center">
            <v-list-item-title class="font-weight-bold text-h6 d-flex justify-center align-center" style="height: 100%;">
              {{ authStore.user?.username || "User" }}
            </v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <!-- Go to edit profile -->
          <v-list-item @click="goToEditProfile" class="profile-option">
            <v-list-item-title>
              <v-icon icon="mdi-account-edit" class="mr-3 text-primary"></v-icon> Edit Profile
            </v-list-item-title>
          </v-list-item>

          <!-- Go to user products -->
          <v-list-item @click="goToUserProducts(authStore.getUserId)" class="profile-option">
            <v-list-item-title>
              <v-icon icon="mdi-package-variant-closed" class="mr-3 text-info"></v-icon> Your Items
            </v-list-item-title>
          </v-list-item>

          <!-- Go to liked items -->
          <v-list-item @click="goToLikedItems(authStore.getUserId)" class="profile-option">
            <v-list-item-title>
              <v-icon icon="mdi-heart-outline" class="mr-3 text-info"></v-icon> Liked Items
            </v-list-item-title>
          </v-list-item>

          <!-- Logout -->
          <v-list-item @click="logout" class="profile-option logout-option">
            <v-list-item-title>
              <v-icon icon="mdi-logout" class="mr-3 text-red-darken-2"></v-icon> Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Login & Register Buttons -->
      <div v-if="!authStore.loggedIn" class="d-flex align-center">
        <v-btn 
          to="/login" 
          class="bg-cyan-lighten-3 mr-2 px-4" 
          elevation="4" 
          rounded="lg"
        >
          <v-icon icon="mdi-account" class="mr-2"></v-icon> Login
        </v-btn>

        <!-- Register Button -->
        <v-btn 
          to="/register" 
          class="bg-cyan-lighten-5 px-4" 
          elevation="4" 
          rounded="lg"
        >
          <v-icon icon="mdi-account-plus" class="mr-2"></v-icon> Register
        </v-btn>
      </div>
      
    </template>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Set up auth store, router, and backend URL
const authStore = useAuthStore();
const router = useRouter();
const backendUrl = "http://localhost:5000";

// Navigation functions
const goHome = () => router.push('/');
const goToEditProfile = () => router.push('/profile');
const goToAddItem = () => router.push('/add');
const goToUserProducts = (userId) => router.push({ path: `/useritems/${userId}` });
const goToExchangeProposals = () => router.push('/exchangeproposals');
const goToLikedItems = () => router.push('/likeditems');
//const alertNeedLogin = () => alert('You must be logged in to add an item.');

// Logout function
const logout = () => {
  authStore.logout();
  router.push('/');
};

// Function to get the product image URL
const getProfileImageUrl = (path) => {
  if (!path) return "avatar-default-symbolic.svg";
  return path.startsWith("http") ? path : `${backendUrl}${path}`;
};
</script>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: bold;
  color: white;
  transition: 0.3s;
}
.page-title:hover {
  color: #80deea;
}

.profile-avatar:hover {
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.2);
}

.profile-menu {
  min-width: 220px;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-option:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.logout-option {
  color: #d32f2f;
  font-weight: bold;
}
.logout-option:hover {
  background-color: rgba(211, 47, 47, 0.1);
}
</style>