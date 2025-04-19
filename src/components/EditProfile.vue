<template>
    <!-- Form fields for editing user profile -->
    <form>
      <!-- Username -->
      <v-text-field
        v-model="state.username"
        :counter="10"
        :error-messages="v$.username.$errors.map(e => e.$message)"
        label="Username"
        required
        @blur="v$.username.$touch()"
        @input="v$.username.$touch()"
      ></v-text-field>

      <!-- Name -->
      <v-text-field
        v-model="state.name"
        :counter="10"
        :error-messages="v$.name.$errors.map(e => e.$message)"
        label="First Name"
        required
        @blur="v$.name.$touch"
        @input="v$.name.$touch"
      ></v-text-field>

      <!-- Surname -->
      <v-text-field
        v-model="state.surname"
        :counter="10"
        :error-messages="v$.surname.$errors.map(e => e.$message)"
        label="Surname"
        required
        @blur="v$.surname.$touch"
        @input="v$.surname.$touch"
      ></v-text-field>
      
      <!-- Email -->
      <v-text-field
        v-model="state.email"
        :error-messages="v$.email.$errors.map(e => e.$message)"
        label="E-mail"
        required
        disabled
        @blur="v$.email.$touch"
        @input="v$.email.$touch"
      ></v-text-field>
      
      <!-- Password -->
      <v-text-field
        v-model="state.password"
        :error-messages="v$.password.$errors.map(e => e.$message)"
        hint="Create a valid password with a minimum of 8 characters containing at least one number."
        label="Password"
        required
        type="input"
        @blur="v$.password.$touch"
        @input="v$.password.$touch"
      ></v-text-field>
      
      <!-- Submit Button -->
      <v-btn
        class="me-4"
        @click="v$.$validate && submitForm()"
      >
        submit
      </v-btn>
    </form>

    <!-- Alerts for success and error messages -->
    <v-alert v-if="successMessage"
            text="Profile edited successfully."
            icon="$success"
            type="success"
            close-label="Close Alert"
            closable
      ></v-alert>
      <v-alert v-else-if="errorMessage"
            text="Error in updating profile."
            icon="$error"
            type="error"
            close-label="Close Alert"
            closable
      ></v-alert>
</template>
  
<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, email, helpers } from '@vuelidate/validators';
import axios from "axios";
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router'

// Set up variables and state
const router = useRouter()
const authStore = useAuthStore();
const userId = computed(() => authStore.getUserId);
const state = reactive({
  username: '',
  name: '',
  surname: '',
  email: '',
  password: ''
});

// Function to navigate to the home page
async function goHome() {
  router.push('/');
}

// Async function to check if username is unique
const isUsernameUnique = helpers.withAsync(async (value) => {
  if (!value) return true;
  try {
    const response = await axios.get(`http://localhost:5000/users/all`);
    const currentUserResponse = await axios.get(`http://localhost:5000/users/find/${userId.value}`);

    const currentUsername = currentUserResponse.data.username;
    const usernamesTaken = response.data.map(user => user.username);

    if (usernamesTaken.includes(value) && value !== currentUsername) {
      // set the error message username is already taken
      console.log("Username is already taken");
      throw new Error("Username is already taken");
    } return true;
  } catch (error) {
    console.error("Error checking username uniqueness:", error);
    throw new Error(error.message || "Error checking username");
  }
});

// Define validation rules
const rules = {
  username: {
    required,
    isUsernameUnique: helpers.withMessage('Username is already taken', isUsernameUnique)
  },
  name: { required },
  surname: { required },
  email: { required, email },
  password: {
    required,
    minLength: minLength(8),
    containsNumber: (value) => /[0-9]/.test(value) || "Password must contain at least one number"
  }
};
// Initialize Vuelidate
const v$ = useVuelidate(rules, state);

// Fetch user profile
const fetchUserProfile = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const response = await axios.get(`http://localhost:5000/users/find/${userId.value}`);
    const data = response.data;
    state.username = data.username;
    state.name = data.name;
    state.surname = data.surname;
    state.email = data.email;
    state.password = data.password;
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

// Fetch user profile on component mount
onMounted(fetchUserProfile);

// Alert messages
const successMessage = ref(false);
const errorMessage = ref(false);

// Submit form
const submitForm = async () => {
  successMessage.value = false;
  errorMessage.value = false;

  const validationResult = await v$.value.$validate();
  if (!validationResult) {
    console.log("Form is invalid.");
    errorMessage.value = true;
    setTimeout(() => errorMessage.value = false, 3000);
    return;
  }

  try {
    const response = await axios.patch(`http://localhost:5000/users/update/${userId.value}`, state);
    console.log("Patch request response:", response);
    successMessage.value = true;
    // Update username in auth store
    authStore.updateUsername(state.username);
    setTimeout(() => {
      successMessage.value = false;
      goHome();
    }, 500);
  } catch (error) {
    console.error("Error in profile update: ", error.response?.data || error.message);
    errorMessage.value = true;
    setTimeout(() => {
      errorMessage.value = false
    }, 500);

  }
};
</script>
