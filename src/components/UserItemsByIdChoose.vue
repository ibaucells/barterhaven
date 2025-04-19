<template>
    <v-container fluid>
      <h2 class="mb-4" style="color: #FFD700; text-align: center; font-weight: bold; font-size: 2em; text-shadow: 2px 2px 4px #000000;">ITEMS FROM {{ username }}</h2>
      <v-row justify="center">
        <v-col v-if="userProducts.length" v-for="(item, i) in userProducts" :key="i" cols="12" md="8" class="mb-6 d-flex justify-center">
          <v-card outlined class="d-flex flex-column flex-md-row align-center elevation-12 pa-6" style="width: 50%; height: 250px;">
            
            <!-- Checkbox for selection -->
            <v-checkbox v-model="selectedItems" :value="item" class="select-checkbox" label="Select"></v-checkbox>
            
            <!-- Text Content -->
            <v-card-text class="d-flex flex-column justify-space-between flex-grow-1">
              <div>
                <v-card-title class="font-weight-bold text-h6">{{ item.title }}</v-card-title>
                <v-card-subtitle class="text-subtitle-2">User: {{ username }}</v-card-subtitle>
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
  
        <v-col v-else>
          <p>No items available.</p>
        </v-col>
      </v-row>
  
      <!-- Confirm Selection Button -->
      <v-btn color="green" class="mt-4" @click="confirmSelection">Confirm Selection</v-btn>
    </v-container>
  </template>
  
  <script setup>
  import { useRouter, useRoute } from 'vue-router';
  import { ref, computed, onMounted } from 'vue';
  
  // Set up variables
  const route = useRoute();
  const router = useRouter();
  const backendUrl = "http://localhost:5000";
  const allProducts = ref([]);
  const selectedItems = ref([]);
  const username = ref('');
  const userId = computed(() => route.params.userId);
  const proposalId = computed(() => route.query.proposal); // Get proposalId from query params

  // Fetch products from the backend
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${backendUrl}/products`);
      if (!response.ok) throw new Error("Failed to fetch products.");
      const data = await response.json();
      allProducts.value = data;

      // Fetch username
      console.log("User ID:", userId.value);
      const usernameFetch = await fetch(`http://localhost:5000/users/find/${userId.value}`);
      if (!usernameFetch.ok) throw new Error('Failed to fetch username');
      const usernameData = await usernameFetch.json();
      username.value = usernameData.username;

    } catch (error) {
      console.error(error);
    }
  };

// Filter products by user ID
const userProducts = computed(() => {
  return allProducts.value.filter((item) => item.userId === Number(userId.value));
});

// Confirm selection and store selected items in sessionStorage
const confirmSelection = () => {
  if (proposalId.value) {
      const selectedProductData = selectedItems.value.map(item => ({
          id: item.productId, 
          title: item.title
      }));
      sessionStorage.setItem(`selectedUserItems_${proposalId.value}`, JSON.stringify(selectedProductData));
  } else {
      console.error("No proposal ID found in query params.");
  }
  router.back();
};

// Function to navigate to item details
const goToItem = (id) => {
  router.push({ path: `/item/${id}` });
};

// Function to get the product image URL
const getProductImageUrl = (path) => {
  return path && path.startsWith("http") ? path : `${backendUrl}${path}`;
};
  
// Load selected items for this proposal when the page loads
onMounted(async () => {
await fetchProducts();

if (proposalId.value) {
    const storedItems = JSON.parse(sessionStorage.getItem(`selectedUserItems_${proposalId.value}`)) || [];
    selectedItems.value = storedItems;
    console.log("Selected items (UserItemsByIdChoose.vue):", selectedItems.value);
}
});


</script>

<style scoped>
.select-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
}

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
