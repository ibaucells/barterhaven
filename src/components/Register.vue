<template>
  <v-container class="d-flex justify-center align-center">
    <v-card class="form-card">
      <!-- Profile Picture -->
      <v-avatar size="80" class="profile-avatar">
        <v-img v-if="profilePicture" :src="profilePicture" />
        <v-icon v-else size="80" color="grey-darken-2">mdi-panda</v-icon>
      </v-avatar>

      <!-- File Upload -->
      <v-file-input
        v-model="selectedFile"
        label="Upload Profile Picture"
        prepend-icon="mdi-camera"
        accept="image/*"
        @change="handleFileUpload"
        outlined
        dense
        class="file-input"
      ></v-file-input>

      <!-- Form Fields -->
      <v-form @submit.prevent="submitForm">
        <v-text-field
          v-model="state.username"
          :error-messages="v$.username.$errors.map(e => e.$message)"
          label="Username"
          required
          @blur="v$.username.$touch"
        ></v-text-field>

        <v-text-field
          v-model="state.name"
          :error-messages="v$.name.$errors.map(e => e.$message)"
          label="First Name"
          required
          @blur="v$.name.$touch"
        ></v-text-field>

        <v-text-field
          v-model="state.surname"
          :error-messages="v$.surname.$errors.map(e => e.$message)"
          label="Surname"
          required
          @blur="v$.surname.$touch"
        ></v-text-field>

        <v-text-field
          v-model="state.email"
          :error-messages="v$.email.$errors.map(e => e.$message)"
          label="E-mail"
          required
          type="email"
          @blur="v$.email.$touch"
        ></v-text-field>

        <v-text-field
          v-model="state.password"
          :error-messages="v$.password.$errors.map(e => e.$message)"
          hint="Min 8 characters, at least 1 number."
          label="Password"
          required
          type="password"
          @blur="v$.password.$touch"
        ></v-text-field>

        <!-- Success Alert -->
        <v-alert v-if="successMessage" type="success" class="success-alert">
          {{ successMessage }}
        </v-alert>

        <!-- Error Alert -->
        <v-alert v-if="errorMessage" type="error" class="error-alert">
          {{ errorMessage }}
        </v-alert>

        <!-- Submit and Clear Buttons -->
        <v-btn class="submit-btn" color="primary" block @click="submitForm">
          Register
        </v-btn>
        <v-btn color="secondary" block @click="clear">
          Clear
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { email, required, minLength } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAuthStore } from '@/stores/auth';    

// Initialize variables and state
const authStore = useAuthStore();
const router = useRouter();
const selectedFile = ref(null);
const profilePicture = ref(null);
const successMessage = ref("");
const errorMessage = ref(""); // New error message reactive variable
const initialState = {
  username: "",
  name: "",
  surname: "",
  email: "",
  password: "",
  userId: 0,
};

const state = reactive({ ...initialState });

// Validation rules
const rules = {
  username: { required },
  name: { required },
  surname: { required },
  email: { required, email },
  password: { required, minLength: minLength(8), containsNumber: (value) => /\d/.test(value) },
  userId: {},
};

// Set up validation
const v$ = useVuelidate(rules, state);

// Handle file upload
const handleFileUpload = (event) => {
  if (event && event.target.files.length) {
    const file = event.target.files[0]; // Get the File object
    selectedFile.value = file; // Store it in the ref

    const formData = new FormData();
    formData.append("profilePicture", file); // Append the actual File object

    // Log FormData contents
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Upload to the server
    axios.post("http://localhost:5000/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(response => {
        console.log("Upload successful:", response.data);
        profilePicture.value = URL.createObjectURL(file); // Preview the image
      })
      .catch(error => {
        console.error("Error uploading file:", error);
        errorMessage.value = "Error uploading file. Please try again."; // Set error message
      });
  }
};

// Generate userId
async function generateUserId() {
  try {
    const response = await axios.get("http://localhost:5000/users/all");
    state.userId = Object.keys(response.data).length + 1;
  } catch (error) {
    console.error("Error generating userId:", error.message);
    state.userId = null;
  }
}

// Submit form
async function submitForm() {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  await generateUserId();
  if (!state.userId) return;

  try {
    const formData = new FormData();
    Object.entries(state).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (selectedFile.value) {
      formData.append("profilePicture", selectedFile.value);
    }

    await axios.post("http://localhost:5000/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    successMessage.value = "User registered successfully! Redirecting...";

    // Login
    //authStore.login(state.userId);
    // Login and set user data in the store
    authStore.login(state.userId, { username: formData.get("username"), profilePicture: "/uploads/" + selectedFile.value.name }); // Pass user data to the store
    console.log("User logged in:", state.userId);
    console.log("User data:", { username: formData.get("username"), profilePicture: "/uploads/" + selectedFile.value.name });
    // Wait 2 seconds and redirect to home
    setTimeout(() => {
      router.push("/"); // Redirect to home page
    }, 2000);
  } catch (error) {
    console.error("Error creating user:", error.message);
    errorMessage.value = "Error creating user. Please try again."; // Set error message
  }
}

// Clear form
function clear() {
  v$.value.$reset();
  Object.assign(state, initialState);
  profilePicture.value = null;
  successMessage.value = "";
  errorMessage.value = ""; // Reset error message
}
</script>

<style scoped>
.form-card {
  max-width: 400px;
  width: 100%;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.profile-avatar {
  margin: 0 auto 16px;
  background-color: #f5f5f5;
  border: 2px solid #ddd;
}

.file-input {
  margin-bottom: 16px;
}

.submit-btn {
  margin-top: 12px;
}

.success-alert {
  margin-top: 12px;
}

.error-alert {
  margin-top: 12px;
}
</style>
