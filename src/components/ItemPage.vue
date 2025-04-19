<template>
  <v-card class="mx-auto my-8" elevation="16" max-width="600">
    <!--Item card with image, title, description, and other details-->
    <v-card-item>
      <v-alert class="pa-2 ma-2" v-if="item.state === 'reserved'" type="warning" dismissible color="yellow darken-2">Item reserved</v-alert>
      <v-card-title class="text-center">{{ item.title }}</v-card-title>
      <v-card-subtitle class="text-subtitle-2">User: {{ username }}</v-card-subtitle>
      <p class="text-body-2 mt-2"><strong>Category:</strong> {{ item.category }}</p>
      <p class="text-body-2"><strong>Location:</strong> {{ item.location }}</p>
      <p class="text-body-2"><strong>Published on:</strong> {{ date.format(item.createdAt, 'fullDate') }}</p>
    </v-card-item>
    <v-card-text>
      {{ item.description }}
    </v-card-text>
    <v-carousel :key="carouselKey" class="carousel" hide-delimiters>
      <v-carousel-item
        v-for="(image, i) in item.images" :key="i"
        :src="getProductImageUrl(image)"
        class="product-image flex-shrink-0"
        contain
      ></v-carousel-item>
    </v-carousel>

    <!-- Toolbar with buttons for editing, deleting, and liking the item -->
    <v-toolbar>
      <!-- Remove item button -->
      <template v-slot:prepend v-if="authStore.isAuthenticated && authStore.getUserId === item.userId">
        <v-tooltip text="Remove item">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-delete-outline" alt="Delete item" @click="confirmDialog = true"></v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Edit item">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-pencil-outline" @click="goToEditItem(item.productId)" alt="Edit item"></v-btn>
          </template>
        </v-tooltip>
      </template>
      
      <!-- Like item button -->
      <template v-slot:append v-if="authStore.isAuthenticated && authStore.getUserId != item.userId">
        <v-tooltip text="I like this item">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" :icon="isLiked ? 'mdi-heart' : 'mdi-heart-outline'" :color="isLiked ? 'red' : ''" alt="I like it" @click="toggleLike"></v-btn>
          </template>
        </v-tooltip>

        <!-- Exchange item button -->
        <v-btn
          v-if="!exchangeRequested"
          append-icon="mdi-transfer"
          alt="Exchange item"
          elevation="16"
          :color=success
          @click="handleExchangeClick"
        >
          Exchange item
        </v-btn>
        <v-tooltip text="You already exchanged this item!">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props"
          v-if="exchangeRequested"
          append-icon="mdi-transfer"
          alt="Exchange item"
          elevation="16"
          :color="'info'"
        >
          Item already exchanged
        </v-btn>
          </template>
        </v-tooltip>

      <!-- Only show exchange button if user is authenticated and not the owner of the item -->
      </template>
      <v-alert v-if="!authStore.isAuthenticated" type="info" dismissible>
        You need to be authenticated to exchange items.
      </v-alert>
    
    <!-- Confirm deletion dialog -->
    </v-toolbar>
        <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Deletion</v-card-title>
        <v-card-text>Are you sure you want to delete this item?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="confirmDialog = false">Cancel</v-btn>
          <v-btn color="red" text @click="confirmDelete(item._id)">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, watchEffect, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useDate } from 'vuetify'
import { useAuthStore } from '@/stores/auth';
import axios from "axios";

// Set up variables
const authStore = useAuthStore();
const date = useDate()
const route = useRoute();
const item = ref({ images: [] }); // Ensure `images` is an array initially
const id = ref(route.params.id); // Make id reactive
const confirmDialog = ref(false);
const backendUrl = "http://localhost:5000"; // server

// State to track if exchange is requested
const exchangeRequested = ref(false);
const router = useRouter();

// Function to navigate to the edit item page
const goToEditItem = (id) => {
  router.push({ path: `/edit/${id}` });
};

// Function to check if the user has already exchanged the item
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      const userId = authStore.getUserId;
      const response = await fetch(`${backendUrl}/proposals/user/${userId}`);
      const data = await response.json();

      for (const proposal of data) {
        if (proposal.initiatorItems.includes(id.value) && (proposal.state === "pending" || proposal.state === "accepted")) {
          console.log("User has already exchanged this item.");
          exchangeRequested.value = true;
          break; // No need to keep looping if we found a match
        }
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  } else {
    exchangeRequested.value = false;
  }
});

// Function to fetch item data
const fetchItem = async () => {
  if (!id.value) return; // Prevent fetching with undefined ID

  try {
    const response = await fetch(`${backendUrl}/products/find/${id.value}`);
    if (!response.ok) throw new Error("Failed to fetch item");

    const data = await response.json();
    item.value = { ...data, images: data.images || [] }; // Ensure images is always an array
  } catch (error) {
    console.error("Error fetching item:", error);
  }
};

// Ensure reactivity if `id` changes dynamically
watchEffect(fetchItem);

const username = ref('');

const fetchUsername = async (userId) => {
  try {
    const response = await fetch(`${backendUrl}/users/find/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch username');
    const data = await response.json();
    username.value = data.username; // Vue will reactively update UI
  } catch (error) {
    console.error(error);
  }
};

watchEffect(() => {
  if (item.value.userId) {
    fetchUsername(item.value.userId);
  }
});



const getProductImageUrl = (path) => {
  if (!path) return; 
  return path.startsWith("http") ? path : `${backendUrl}${path}`;
};

const carouselKey = ref(0);

watchEffect(() => {
  if (item.value.images?.length) {
    carouselKey.value++; // Change key to force re-render
  }
});

async function handleExchangeClick() {
  const initiatorId = authStore.getUserId;  // Get the ID of the user who initiated the exchange
  const receiverId = item.value.userId; // Get the ID of the user who will receive the item

  try {
    console.log("Exchange item:", item.value);
    await axios.post(`${backendUrl}/proposals`, {
      initiatorId: initiatorId,
      receiverId: receiverId,
      initiatorItems: [item.value.productId],
    });
    console.log("Item exchanged successfully.");
    exchangeRequested.value = true; // Set exchangeRequested to true when button is clicked
  } catch (error) {
    console.error("Error exchanging item:", error);
  }
};

const confirmDelete = async (id) => {
  try {
    await axios.delete(`${backendUrl}/products/delete/${id}`);
    router.push("/");
  } catch (error) {
    console.error("Error deleting item:", error);
  }
  confirmDialog.value = false;
};


const isLiked = ref(false);

const checkIfLiked = async () => {
  try {
    if (authStore.isAuthenticated) {
      const userId = authStore.getUserId;
      // Fetch the user data to check if the product is liked
      const response = await axios.get(`${backendUrl}/users/find/${userId}`);
      // Check if the likedProducts array includes the current product ID
      isLiked.value = response.data.likedProducts.includes(id.value);
    }
  } catch (error) {
    console.error("Error checking liked status:", error);
  }
};

watchEffect(checkIfLiked);

const toggleLike = async () => {
  try {
    if (!authStore.isAuthenticated) return;

    const userId = authStore.getUserId;
    const action = isLiked.value ? "remove" : "add"; // Ensure action is set

    await axios.patch(`${backendUrl}/users/update/${userId}`, {
      likedProducts: item.value.productId, // Send just the productId, not an object
      action // Send action explicitly
    });

    isLiked.value = !isLiked.value;
  } catch (error) {
    console.error("Error updating liked status:", error);
  }
};

onMounted(async () => {
  await checkIfLiked();
});

</script>

<style scoped>
.product-image {
  max-width: 100%;
  max-height: 200px; /* Set a maximum height */
  width: auto;       /* Adjust width to maintain aspect ratio */
  height: auto;      /* Maintain aspect ratio */
}

.carousel {
  max-width: 100%;
  max-height: 300px; /* Set a maximum height */
  width: auto;       /* Adjust width to maintain aspect ratio */
  height: auto;      /* Maintain aspect ratio */
}
</style>
