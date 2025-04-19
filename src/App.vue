<template>
  <v-app>
    <NavBar />
    <v-main>
      <router-view />
      <v-container fluid>
        <!-- Back Button -->
        <v-row justify="center">
          <v-col cols="12" class="d-flex justify-center my-6">
            <v-btn 
              v-if="canGoBack" 
              color="blue-darken-2" 
              variant="tonal"
              class="px-6 py-3 rounded-lg text-white font-weight-bold"
              @click="goBack"
            >
              <v-icon left>mdi-arrow-left</v-icon> Go Back
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const router = useRouter();
const canGoBack = ref(false);

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  }
};

onMounted(() => {
  canGoBack.value = window.history.length > 1;
});
</script>
