<template>
    <v-container>
      <!-- Form to edit item -->
      <v-form @submit.prevent="updateItem">
        <!-- Title and Description -->
        <v-text-field v-model="state.title" label="Title" required></v-text-field>
        <v-text-field v-model="state.description" label="Description" required></v-text-field>

        <!-- Category Selection -->
        <v-select v-model="state.category" :items="categories" label="Category" required></v-select>
  
        <!-- Image Upload -->
        <v-file-input 
          v-model="selectedFiles" 
          label="Upload Images" 
          multiple 
          accept="image/*"
          prepend-icon="mdi-camera"
          @change="handleFileUpload"
        ></v-file-input>
  
        <!-- Image Preview (Existing + New) -->
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
          v-model="state.location"
          :items="quarters"
          label="Select Location (Quarter of Barcelona)"
          required
        ></v-select>
        
        <!-- Submit Button -->
        <v-btn type="submit" color="primary">Update Item</v-btn>
  
        <!-- Alerts for success and error messages -->
        <v-alert v-if="state.error" type="error" dismissible>{{ state.error }}</v-alert>
        <v-alert v-if="state.success" type="success" dismissible>Item updated successfully!</v-alert>
      </v-form>
    </v-container>
  </template>
  
  <script setup>
  import { reactive, ref, onMounted } from "vue";
  import axios from "axios";
  import { useRoute } from "vue-router";
  import { useRouter } from 'vue-router'
  
  // Set up variables and state
  const route = useRoute();
  const router = useRouter()
  const productId = route.params.id; // Get product ID from route params
  const selectedFiles = ref([]);
  const imagePreviews = ref([]);
  const state = reactive({
    title: "",
    description: "",
    category: "",
    images: [],
    location: "",
    error: null,
    success: false
  });

  async function goHome() {
  router.push('/');
}
  
  // Define categories
  const categories = [
    "Electronics", "Clothing", "Furniture", "Books", "Toys",
    "Sports", "Home Appliances", "Music", "Tools", "Miscellaneous"
  ];

  // Define quarters of Barcelona
  const quarters = [
    "Ciutat Vella", "Eixample", "Sants-Montjuïc", "Les Corts",
    "Gràcia", "Horta-Guinardó", "Sant Andreu", "Sant Martí",
    "Nou Barris", "Sarrià-Sant Gervasi"
  ];
  
  // Fetch existing product details
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/products/find/${productId}`);
      const data = response.data;
      state.title = data.title;
      state.description = data.description;
      state.category = data.category;
      state.location = data.location;
      state.images = data.images || [];
  
      // Pre-load existing image URLs
      imagePreviews.value = state.images.map(img => `http://localhost:5000${img}`);
    } catch (error) {
      console.error("Error fetching product:", error);
      state.error = "Failed to load product.";
    }
  };
  
  // Handle new image uploads
  const handleFileUpload = (event) => {
    if (!event) return;
    
    const files = event.target.files;
    selectedFiles.value = [...files];
  
    // Merge new previews with existing ones
    const newPreviews = selectedFiles.value.map((file) => URL.createObjectURL(file));
    imagePreviews.value = [...state.images.map(img => `http://localhost:5000/uploads/${img}`), ...newPreviews];
  };
  
  // Remove image from preview
  const removeImage = (index) => {
    if (index < state.images.length) {
      // Remove existing image
      state.images.splice(index, 1);
    } else {
      // Remove newly uploaded image
      selectedFiles.value.splice(index - state.images.length, 1);
    }
    imagePreviews.value.splice(index, 1);
  };
  
  // Update product
const updateItem = async () => {
  state.error = null;
  state.success = false;

  try {
    const formData = new FormData();
    formData.append("title", state.title);
    formData.append("description", state.description);
    formData.append("category", state.category);
    formData.append("location", state.location);

    // Keep existing images
    state.images.forEach(img => formData.append("existingImages", img));
    // Add new images
    selectedFiles.value.forEach(file => formData.append("images", file));

    // Remove existing images that are not in the current state.images
    const currentExistingImages = state.images.map(img => img);
    formData.append("existingImages", JSON.stringify(currentExistingImages));

    await axios.put(`http://localhost:5000/products/${productId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    state.success = true;
    
    setTimeout(goHome, 500);

  } catch (error) {
    console.error("Error updating product:", error);
    state.error = "Failed to update item.";
  }
};

  
  // Fetch product details on mount
  onMounted(fetchProduct);
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
  