<template>
  <v-container fluid>
    <v-row justify="center">
      <!-- Background Container (8 Cols) -->
      <v-col cols="12" md="6">
        <v-sheet class="content-wrapper pa-6">
          <!-- Search Bar -->
            <v-sheet class="search-bar pa-4 mb-6" elevation="12" style="background-color: #36454F">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field 
                  v-model="filters.title" 
                  label="Search by title" 
                  outlined 
                  dense 
                  clearable
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                ></v-text-field>
              </v-col>

              <!-- Category Selection -->
              <v-col cols="12" md="4">
                <v-select 
                  v-model="filters.category" 
                  :items="categoryOptions" 
                  label="Category" 
                  outlined 
                  dense 
                  clearable
                  hide-details
                  prepend-inner-icon="mdi-tag"
                ></v-select>
              </v-col>

              <!-- Location Selection -->
              <v-col cols="12" md="4">
                <v-select 
                  v-model="filters.location" 
                  :items="locationOptions" 
                  label="Location" 
                  outlined 
                  dense 
                  clearable
                  hide-details
                  prepend-inner-icon="mdi-map-marker"
                ></v-select>
              </v-col>
            </v-row>
          </v-sheet>

          <!-- Items List -->
          <v-row justify="center">
            <v-col 
              v-if="filteredItems.length" 
              v-for="(item, i) in filteredItems" 
              :key="i" 
              cols="12" 
              class="mb-6 d-flex justify-center"
            >
              <v-card 
                outlined 
                class="d-flex flex-column flex-md-row align-center elevation-12 pa-6 item-card"
              >
                <v-card-text class="d-flex flex-column justify-space-between flex-grow-1">

                  <v-alert class="pa-2" v-if="item.state === 'reserved'" type="warning" dismissible color="yellow darken-2">Reserved</v-alert>
                  <div>
                    <v-card-title class="font-weight-bold text-h6">{{ item.title }}</v-card-title>
                    <v-card-subtitle class="text-subtitle-2">User: {{ usernames[item.userId] }}</v-card-subtitle>
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

            <!-- No items available message -->
            <v-col v-else>
              <p>No items available.</p>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { reactive, watch, computed } from 'vue';

const router = useRouter();
const backendUrl = "http://localhost:5000"; // server

// Function to navigate to item details
const goToItem = (id) => {
  router.push({ path: `/item/${id}` });
};

// Define props for the component, which includes an array of items
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

// Reactive object for storing usernames
const usernames = reactive({});

// Filters
const filters = reactive({
  title: "",
  category: null,
  location: null
});

// Extract unique category and location options
const categoryOptions = computed(() => [...new Set(props.items.map(item => item.category))]);
const locationOptions = computed(() => [...new Set(props.items.map(item => item.location))]);

// Computed property to filter items
const filteredItems = computed(() => {
  return props.items.filter(item => {
    return (
      (!filters.title || item.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.location || item.location === filters.location) &&
      item.state === "active" || item.state === "reserved"
    );
  });
});

// Fetch usernames
const fetchUsername = async (userId) => {
  if (usernames[userId]) return; // Avoid duplicate requests

  try {
    console.log("Fetching username for user ID:", userId);
    const response = await fetch(`${backendUrl}/users/find/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch username');

    const data = await response.json();
    
    usernames[userId] = data.username; // Vue will reactively update UI
  } catch (error) {
    console.error(error);
    usernames[userId] = 'Unknown';
  }
};

// Watch for changes in `props.items`
watch(() => props.items, (newItems) => {
  newItems.forEach(item => {
    if (!usernames[item.userId]) {
      fetchUsername(item.userId);
    }
  });
}, { immediate: true }); // Run on first load

// Function to get product image URL
const getProductImageUrl = (path) => {
  if (!path) return; 
  return path.startsWith("http") ? path : `${backendUrl}${path}`;
};
</script>

<style scoped>
/* Background wrapper for search bar & items */
.content-wrapper {
  background-color:  #89CFF0; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
}

/* Styled search bar */
.search-bar {
  background-color: #f5f5f5; /* Light grey */
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 100%;
}

/* Card styling */
.item-card {
  width: 100%;
  max-width: 600px;
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 12px;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

/* Product image */
.product-image {
  max-width: 100%;
  max-height: 200px;
  width: auto;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}
</style>