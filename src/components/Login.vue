<template>
  <form>
    <!-- Email field -->
    <v-text-field
      v-model="state.email"
      :error-messages="v$.email.$errors.map(e => e.$message)"
      label="E-mail"
      required
      @blur="v$.email.$touch"
      @input="v$.email.$touch"
    ></v-text-field>

    <!-- Password field -->
    <v-text-field
      v-model="state.password"
      label="Password"
      required
      type="password"
    ></v-text-field>

    <!-- Submit button -->
    <v-btn
      class="me-4"
      @click="v$.$validate && submitForm()"
    >
      submit
    </v-btn>

    <!-- Alerts for success and error messages -->
    <v-alert v-if="authStore.isAuthenticated && login_tried"
      text="Login successful!"
      icon="$success"
      type="success"
      close-label="Close Alert"
      closable
    ></v-alert>
    <v-alert v-else-if="!authStore.isAuthenticated && login_tried"
      text="Invalid email or password. Please, try again."
      icon="$error"
      type="error"
      close-label="Close Alert"
      closable
    ></v-alert>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required } from '@vuelidate/validators'
import { useRouter } from 'vue-router'
import axios from "axios"
import { useAuthStore } from '@/stores/auth';    

// Initialize variables and state
const router = useRouter()
const authStore = useAuthStore();
const login_tried = ref(false)
const initialState = {
  email: '',
  password: ''
}
const state = reactive({
  ...initialState,
})

// Set up validation rules
const rules = {
  email: { required, email },
  password: { required }
}

// Create a Vuelidate instance
const v$ = useVuelidate(rules, state)

// Submit form function
async function submitForm() {
  if (v$.value.$invalid) {
    console.log("Form is invalid.");
    return;
  }
  try {
    const response = await axios.post("http://localhost:5000/users/login", state);
    
    const { userId, username, profilePicture } = response.data.user; // Extract user info from response

    // Login and set user data in the store
    authStore.login(userId, { username, profilePicture }); // Pass user data to the store
    setTimeout(goHome, 500);
  } catch (error) {
    console.error("User not found: ", error.response?.data || error.message);
  }
  login_tried.value = true;
}

// Go to home function
async function goHome() {
  router.push('/');
}
</script>
