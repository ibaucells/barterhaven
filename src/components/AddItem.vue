<template>
  <v-container> 
    <v-form @submit.prevent="addItem">
      <!-- Title and Description -->
      <v-text-field v-model="state.newItem.title" label="Title" required></v-text-field>
      <v-textarea 
        v-model="state.newItem.description" 
        label="Description" 
        auto-grow 
        required
      ></v-textarea>

      <!-- Category Selection -->
      <v-select
        v-model="state.newItem.category"
        :items="categories"
        label="Category"
        required
      ></v-select>

      <!-- Image Upload -->
      <v-file-input 
        v-model="selectedFiles" 
        label="Upload Images" 
        multiple 
        accept="image/*"
        prepend-icon="mdi-camera"
        @change="handleFileUpload"
      ></v-file-input>

      <!-- Image Preview -->
      <v-row v-if="imagePreviews.length" class="mt-3">
        <v-col v-for="(image, index) in imagePreviews" :key="index" cols="4">
          <v-card class="image-preview">
            <v-img :src="image" height="100"></v-img>
            <v-btn icon color="red" small @click="removeImage(index)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- Select Location -->
      <v-select
        v-model="state.newItem.location"
        :items="quarters"
        label="Select Location (Quarter of Barcelona)"
        required
      ></v-select>

      <!-- Submit Button -->
      <v-btn type="submit" color="primary">Add Item</v-btn>

      <!-- Alerts for success and error messages -->
      <v-alert v-if="state.error" type="error" dismissible>{{ state.error }}</v-alert>
      <v-alert v-if="state.success" type="success" dismissible>Item added successfully!</v-alert>
    </v-form>
  </v-container>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

// Set up variables and state
const authStore = useAuthStore();
const selectedFiles = ref([]);
const imagePreviews = ref([]);
const router = useRouter()
const state = reactive({
  newItem: {
    productId: "",
    title: "",
    description: "",
    category: "",
    images: [],
    createdAt: null,
    state: "active",
    userId: null,
    location: "", // Change the property name to location
    exchangeProposals: []
  },
  error: null,
  success: false
});

// Define the categories for the items
const categories = [
  "Electronics", "Clothing", "Furniture", "Books", "Toys",
  "Sports", "Home Appliances", "Music", "Tools", "Miscellaneous"
];

// Define the quarters of Barcelona
const quarters = [
  "Ciutat Vella",
  "Eixample",
  "Sants-Montjuïc",
  "Les Corts",
  "Gràcia",
  "Horta-Guinardó",
  "Sant Andreu",
  "Sant Martí",
  "Nou Barris",
  "Sarrià-Sant Gervasi"
];

// Generate productId when title & userId are available
watch(
  () => [state.newItem.title, state.newItem.userId],
  () => {
    if (state.newItem.title) {
      state.newItem.productId = `${state.newItem.title}_${state.newItem.userId}`;
    }
  }
);

// Fetch user profile on mount
const fetchUserProfile = async () => {
  if (!authStore.isAuthenticated) return;

  const userId = authStore.getUserId;
  console.log("ADD ITEM user id: ", userId);

  state.newItem.userId = userId;
};

// Handle file upload with previews
const handleFileUpload = (event) => {
  if (!event) return;

  const files = event.target.files;
  selectedFiles.value = [...files];

  imagePreviews.value = selectedFiles.value.map((file) =>
    URL.createObjectURL(file)
  );
};

// Remove image from preview & selection
const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};
async function goHome() {
  router.push('/');
}

// Function to add an item
const addItem = async () => {
  state.error = null;
  state.success = false;

  if (state.newItem.userId != null
    && state.newItem.userId === ""
    && state.newItem.userId === undefined
  ) {
    state.error = "User ID is missing. Please log in.";
    return;
  }
  if (!state.newItem.category) {
    state.error = "Please select a category.";
    return;
  }

  state.newItem.createdAt = new Date();

  try {
    const formData = new FormData();
    formData.append("title", state.newItem.title);
    formData.append("description", state.newItem.description);
    formData.append("category", state.newItem.category);
    formData.append("productId", state.newItem.productId);
    formData.append("createdAt", state.newItem.createdAt.toISOString());
    formData.append("state", state.newItem.state);
    formData.append("userId", state.newItem.userId);
    formData.append("location", state.newItem.location); // Use the selected location (quarter)

    selectedFiles.value.forEach((file) => {
      formData.append(`images`, file);
    });
    console.log("FORM DATA: ", formData);

    await axios.post("http://localhost:5000/products", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    state.success = true;
    setTimeout(goHome, 500);

    selectedFiles.value = [];
    imagePreviews.value = [];
  } catch (error) {
    console.error("Error adding item:", error);
    state.error = error.response?.data?.error || "Failed to add item.";
  }
};

// Fetch user on component mount
onMounted(fetchUserProfile);
</script>

<style scoped>
.image-preview {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.image-preview v-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.8);
}
</style>
