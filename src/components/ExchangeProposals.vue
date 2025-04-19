<template>
    <v-container>
    <!-- Header -->
    <h2 class="mb-4" style="color: #FFD700; text-align: center; font-weight: bold; font-size: 2em; text-shadow: 2px 2px 4px #000000;">EXCHANGE PROPOSALS</h2>
  
      <!-- Active Proposals Section -->
      <v-card class="mb-6 pa-4">
        <h3>Active Proposals</h3>
        <v-divider class="mb-4"></v-divider>
        
        <!-- Iterate through all active proposals -->
        <template v-for="proposal in allActiveProposals">
            <!-- Display proposal details initiated by the user -->
            <v-card v-if="initiatedProposals.includes(proposal)" class="mb-6 pa-0" style="background-color: #FFD580; color: black; border-radius: 12px;">
                <v-list-item style="background-color: rgba(239, 193, 128, 0.7); color: #8B0000; font-weight: bold; text-align: right;">
                    <template class ="pa-4" style="color: #8B0000; font-weight: bold; text-align: right;" v-slot:prepend>Status: {{ proposal.state }} — <i> Last updated: {{ date.format(proposal.lastStateDate, 'fullDate')}}</i></template>
                    <template style="color: #8B0000; font-weight: bold; text-align: right;" v-slot:append>Proposal initiated by you</template>
                </v-list-item>
                <p class="pl-4 pb-0">
                <v-icon>mdi-check</v-icon>
                You wanted <strong>{{ proposal.initiatorItemTitles?.join(', ') || "Loading..." }}</strong>
                offered by <strong>{{ proposal.receiverUsername || "Loading..." }}</strong>.
                </p>
                <p v-if="proposal.state === 'unanswered'" class="pl-4 pb-4"><v-icon>mdi-arrow-right</v-icon> Waiting for the user to answer the proposal.</p>
                <p v-if="proposal.state === 'pending'" class="pl-4 pb-4"><v-icon>mdi-arrow-right</v-icon>  He/she proposes exchanging it for your product/s: 
                    <strong>{{ proposal.receiverItemTitles?.join(', ') || "Loading..." }}</strong>.
                    <v-btn color="green" class="ml-2" @click="updateProposalState(proposal, 'accepted')">Accept</v-btn>
                    <v-btn color="red" class="ml-2" @click="updateProposalState(proposal, 'declined')">Decline</v-btn>
                </p>
                <p v-if="proposal.state === 'accepted'" class ="pl-4"><v-icon>mdi-check</v-icon> {{ proposal.receiverUsername || "Loading..." }} accepted to exchange it for your item/s <strong>{{ proposal.receiverItemTitles?.join(', ') || "Loading..." }}</strong>.</p>
                <p v-if="proposal.state === 'accepted'" class ="pl-4"><v-icon>mdi-arrow-right</v-icon> Write to the user by email to set the place and time for the exchange. The email address is <mark>{{ proposal.receiverEmail || "Loading..." }}</mark>. Once the exchange is done, click the button below to close the proposal. However, if the exchange was not successful, click the button below to unreserve the items and close the proposal.</p>
                <btn-group v-if="proposal.state === 'accepted'">
                    <v-btn color="green" class="ma-3 mr-1" @click="updateProposalState(proposal, 'exchanged')">Already exchanged</v-btn>
                    <v-btn color="red" class="ma-3 ml-1" @click="updateProposalState(proposal, 'unanswered')">Unreserve item</v-btn>
                </btn-group>
            </v-card>
            
            <!-- Display proposal details received from another user -->
            <v-card v-if="receivedProposals.includes(proposal)" class="mb-6 pa-0" style="background-color: #8FBC8B; color: black; border-radius: 12px;">
                <v-list-item style="background-color: rgba(122, 175, 129, 0.7); color: #004c00; font-weight: bold; text-align: right;">
                    <template class ="pa-4" style="color: #8B0000; font-weight: bold; text-align: right;" v-slot:prepend>Status: {{ proposal.state }} — <i> Last updated: {{ date.format(proposal.lastStateDate, 'fullDate')}}</i></template>
                    <template style="color: #8B0000; font-weight: bold; text-align: right;" v-slot:append>Proposal initiated by another user</template>
                </v-list-item>
                <p class="pl-4">
                    <strong><v-icon>mdi-check</v-icon> {{ proposal.initiatorUsername || "Loading..." }}</strong> wants your product 
                    <strong>{{ proposal.initiatorItemTitles?.join(', ') || "Loading..." }}</strong>.
                </p>
                <p class="pl-4 pb-0" v-if="proposal.state === 'pending'"><v-icon>mdi-check</v-icon>You offered exchanging it for his/her product <strong>{{ proposal.receiverItemTitles?.join(', ') || "Loading..." }}</strong></p>
                <p class="pl-4 pb-4" v-if="proposal.state === 'pending'"><v-icon>mdi-arrow-right</v-icon> Waiting for <strong>{{ proposal.initiatorUsername || "Loading..." }}</strong>'s approval.</p>
                <p class="pl-4 pb-4" v-if="proposal.state === 'unanswered'"><v-icon>mdi-arrow-right</v-icon> Please, select one or more items from the user to propose an exchange.</p>
                <div class="pl-4 pb-4" v-if="proposal.state === 'unanswered'">
                    <v-btn v-if="!selectedItems[proposal._id]?.length" color="primary" class="ml-2" @click="goToUserProducts( proposal._id, proposal.initiatorId)">
                        Review User's Items
                    </v-btn>
                    <v-row v-if="selectedItems[proposal._id]?.length" class="mt-4">
                        <v-col>
                            <h4>Selected Items for Exchange:</h4>
                            <v-list>
                                <v-list-item v-for="item in selectedItems[proposal._id]" :key="item">
                                    <v-list-item-content>
                                        <v-list-item-title @click="goToItem(item.id)" style="cursor: pointer; background-color: #f0f8ff; color: black; border-radius: 8px; padding: 4px;">
                                            {{ item.title }}
                                        </v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                            <v-btn color="blue" class="ml-2" @click="() => { updateProposal(proposal._id, 'pending'); updateProposalState(proposal, 'accepted'); }">Send Exchange Proposal</v-btn>
                            <v-btn color="red" class="ml-2" @click="discardSelectedItems(proposal._id)">
                                Discard Selected Items
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
                <p v-if="proposal.state === 'accepted'" class ="pl-4"><v-icon>mdi-check</v-icon> You accepted to exchange it for your item/s <strong>{{ proposal.receiverItemTitles?.join(', ') || "Loading..." }}</strong>.</p>
                <p v-if="proposal.state === 'accepted'" class ="pl-4 pb-4"><v-icon>mdi-arrow-right</v-icon> <strong>{{ proposal.initiatorUsername || "Loading..." }}</strong> will write you by email to set the place and time for the exchange. His/her email address is <mark>{{ proposal.initiatorEmail || "Loading..." }}</mark>.</p>
            </v-card>
        
        <!-- No active proposals message -->
        </template>
        <p v-if="!allActiveProposals.length">No active proposals.</p>
      </v-card>
  
      <!-- Closed Proposals Section -->
      <v-card class="pa-4">
        <h3>Closed Proposals</h3>
        <v-divider class="mb-4"></v-divider>
        
        <!-- Iterate through closed proposals -->
        <v-list v-if="closedProposals.length">
          <v-list-item v-for="proposal in closedProposals" :key="proposal._id">
            <div>
              <p v-if="proposal.state === 'accepted'">
                ✅ Your proposal with <strong>{{ proposal.receiverUsername || "Loading..." }}</strong> for 
                <strong>{{ proposal.receiverItemTitles?.join(', ') || "Loading..." }}</strong> was accepted and the items were marked as exchanged on {{ date.format(proposal.lastStateDate, 'fullDate')}}!
              </p>
              <p v-else>
                ❌ Your proposal with <strong>{{ proposal.receiverUsername || "Loading..." }}</strong> was declined on {{ date.format(proposal.lastStateDate, 'fullDate')}}
              </p>
            </div>
          </v-list-item>
        </v-list>
        <p v-else>No closed proposals.</p>
      </v-card>
    </v-container>
</template>
  
<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useDate } from 'vuetify'

// Initialize variables
const router = useRouter();  
const date = useDate()
const authStore = useAuthStore();
const userId = ref(authStore.getUserId);
const proposals = ref([]);
const initiatedProposals = ref([]);
const receivedProposals = ref([]);
const allActiveProposals = ref([]);
const closedProposals = ref([]);
const productCache = ref({});
const userCache = ref({});
const selectedItems = ref({});

// Fetch product title by ID
const fetchProductTitle = async (productId) => {
  if (productCache.value[productId]) return productCache.value[productId];
  try {
    const response = await axios.get(`http://localhost:5000/products/find/${productId}`);
    productCache.value[productId] = response.data.title;
    return response.data.title;
  } catch {
    return "Unknown Product";
  }
};

// Fetch username by ID
const fetchUsername = async (id) => {
  if (userCache.value[id]) return userCache.value[id];
  try {
    const response = await fetch(`http://localhost:5000/users/find/${id}`);
    const data = await response.json();
    userCache.value[id] = data.username;
    return data.username;
  } catch {
    return "Unknown User";
  }
};

// Fetch email by ID
const fetchEmail = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/users/find/${id}`);
    const data = await response.json();
    return data.email;
  } catch {
    return "Unknown Email";
  }
};

// Fetch proposals from the server
const fetchProposals = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/proposals/user/${userId.value}`);
    proposals.value = response.data;
    initiatedProposals.value = proposals.value.filter(p => p.initiatorId === userId.value && p.state !== "declined");
    receivedProposals.value = proposals.value.filter(p => p.receiverId === userId.value && p.state !== "declined");
    closedProposals.value = proposals.value.filter(p => p.state === "exchanged" || p.state === "declined");
    allActiveProposals.value = proposals.value.filter(p => p.state !== "exchanged" && p.state !== "declined");
  } catch (error) {
    console.error("Error fetching proposals:", error);
  }
};

// Watch for changes in proposals and fetch additional data
watchEffect(async () => {
  for (const proposal of proposals.value) {
    proposal.receiverItemTitles = await Promise.all(proposal.receiverItems.map(fetchProductTitle));
    proposal.initiatorItemTitles = await Promise.all(proposal.initiatorItems.map(fetchProductTitle));
    proposal.receiverUsername = await fetchUsername(proposal.receiverId);
    proposal.receiverEmail = await fetchEmail(proposal.receiverId);
    proposal.initiatorEmail = await fetchEmail(proposal.initiatorId);
    proposal.initiatorUsername = await fetchUsername(proposal.initiatorId);
    selectedItems.value[proposal._id] = JSON.parse(sessionStorage.getItem(`selectedUserItems_${proposal._id}`)) || [];
  }
});

// Update proposal state and items
const updateProposalState = async (proposal, newState) => {
  try {
    const proposalId = proposal._id
    await axios.put(`http://localhost:5000/proposals/${proposalId}`, { state: newState });
    fetchProposals();

    if (newState === "exchanged" || newState === "accepted" || newState === "unanswered") {
      newState = newState === "accepted" ? "reserved" : newState;
      newState = newState === "unanswered" ? "active" : newState;
      // Update the state of the selected items
      for (const itemId of proposal.initiatorItems) {
        await axios.put(`http://localhost:5000/products/${itemId}`, { state: newState });
      }
      if (newState === "exchanged") {
        // get the product id from the receiverItems in the proposal
        for (const itemId of proposal.receiverItems) {
          await axios.put(`http://localhost:5000/products/${itemId}`, { state: newState });
        }
      }
      // if newState is active, remove proposal
      if (newState === "active") {
        await axios.delete(`http://localhost:5000/proposals/${proposalId}`);
      }
    }
  } catch (error) {
    console.error("Error updating proposal:", error);
  }
};

// Update proposal with selected items
const updateProposal = async (proposalId, newState) => {
  try {
    const key = proposalId;
    const selectedItemsForProposal = selectedItems.value[key] || [];
    console.log("Selected items (updateProposal):", selectedItemsForProposal.map(item => item.id));

    for (const item of selectedItemsForProposal) {
        await axios.put(`http://localhost:5000/proposals/${proposalId}`, {
            state: newState,
            receiverItems: item.id,
        });
    }
    fetchProposals();
  } catch (error) {
    console.error("Error updating proposal:", error);
  }
};

// Go to user's products page  
const goToUserProducts = (proposalId, initiatorId) => {
  const key = proposalId ; // Use proposalId as the key
  sessionStorage.setItem(`selectedUserItems_${key}`, JSON.stringify(selectedItems.value[key] || []));
  router.push({ 
  path: `/selectuseritems/${initiatorId}`, 
  query: { proposal: proposalId }
});
};

// Handle item selection
const discardSelectedItems = (proposalId) => {
    // Ensure Vue detects reactivity changes
    selectedItems.value = { ...selectedItems.value, [proposalId]: [] };
  
    // Clear sessionStorage
    sessionStorage.removeItem(`selectedUserItems_${proposalId}`);

    console.log(`Discarded selected items for proposal ${proposalId}`);
};

// Navigate to item page
const goToItem = (id) => {
    router.push({ path: `/item/${id}` });
  };

// Fetch proposals on component mount
onMounted(fetchProposals);
</script>
  
<style scoped>
h2, h3, h4 { color: #333; }
.v-card { background-color: #f9f9f9; border-radius: 12px; }
.v-btn { text-transform: none; }
</style>