<template>
    <v-container fluid>
      <h2 class="mb-4" style="color: #FFD700; text-align: center; font-weight: bold; font-size: 2em; text-shadow: 2px 2px 4px #000000;">
        ITEMS YOU LIKE
      </h2>
      <v-row justify="center">
        <!-- Liked Items -->
        <v-col v-if="likedProducts.length" v-for="(item, i) in likedProducts" :key="i" cols="12" md="8" class="mb-6 d-flex justify-center">
          <v-card outlined class="d-flex flex-column flex-md-row align-center elevation-12 pa-6" style="width: 50%; height: 250px;">
            <!-- Text Content -->
            <v-card-text class="d-flex flex-column justify-space-between flex-grow-1">
              <div>
                <v-card-title class="font-weight-bold text-h6">{{ item.title }}</v-card-title>
                <p class="text-body-2 mt-2"><strong>Category:</strong> {{ item.category }}</p>
                <p class="text-body-2"><strong>Location:</strong> {{ item.location }}</p>
              </div>
              <v-card-actions class="mt-3">
                <v-btn color="indigo darken-2" dark @click="goToItem(item.productId)" class="ma-auto">See more</v-btn>
              </v-card-actions>
            </v-card-text> 
  
            <!-- Product Image --> 
            <v-img
              v-if="item.images.length"
              :src="getProductImageUrl(item.images[0])"
              class="product-image flex-shrink-0"
              contain
            ></v-img>
          </v-card>
        </v-col>
        
        <!-- No liked items available message -->
        <v-col v-else>
          <p>No liked items found.</p>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  import { ref, computed, onMounted } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  
  // Set up variables
  const router = useRouter();
  const backendUrl = "http://localhost:5000";
  const authStore = useAuthStore();
  const allProducts = ref([]);
  const likedProductIds = ref([]);
  
  // Fetch liked products from the backend
  const fetchLikedProducts = async () => {
    try {
      const userId = authStore.getUserId;
      if (!userId) return;  
      const userResponse = await fetch(`${backendUrl}/users/find/${userId}`);
      if (!userResponse.ok) throw new Error("Failed to fetch user data.");
      const userData = await userResponse.json();
      likedProductIds.value = userData.likedProducts || [];
      const productsResponse = await fetch(`${backendUrl}/products`);
      if (!productsResponse.ok) throw new Error("Failed to fetch products.");
      allProducts.value = await productsResponse.json();
    } catch (error) {
      console.error(error);
    }
  };
  
  // Filter liked products
  const likedProducts = computed(() => {
    return allProducts.value.filter((item) => likedProductIds.value.includes(item.productId));
  });
  
  // Function to navigate to item details
  const goToItem = (id) => {
    router.push({ path: `/item/${id}` });
  };
  
  // Function to get the product image URL
  const getProductImageUrl = (path) => {
    return path && path.startsWith("http") ? path : `${backendUrl}${path}`;
  };
  
  // Fetch liked products on component mount
  onMounted(fetchLikedProducts);
  </script>
  
  <style scoped>
  .v-card {
    transition: transform 0.3s, box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    position: relative;
  }
  
  .v-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }
  
  .product-image {
    max-width: 100%;
    max-height: 200px;
    width: auto;
    height: auto;
    border-radius: 8px;
    object-fit: contain;
  }
  </style>
  