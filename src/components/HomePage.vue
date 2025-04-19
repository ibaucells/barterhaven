<template>
    <ItemList :items="items" />
</template>
  
<script>
  import { ref, onMounted } from "vue";
  import axios from "axios"; // Import axios
  import ItemList from "./ItemList.vue";
  
  // Define the HomePage component
  export default {
    name: "HomePage",
    components: { ItemList },
    setup() {
      // Reactive array for items
      const items = ref([]);
  
      // Fetch items on component mount
      onMounted(async () => {
        try {
          const response = await axios.get("http://localhost:5000/products");
          items.value = response.data; // Assuming the API returns an array
        } catch (error) {
          console.error("Failed to fetch items:", error);
        }
      });
  
      // Return reactive data to the template
      return { items };
    },
  };
  </script>
  