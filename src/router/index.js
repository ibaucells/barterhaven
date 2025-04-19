import { createRouter, createWebHistory } from 'vue-router';
//import { routes } from 'vue-router/auto-routes';

import HomePage from "../components/HomePage.vue"
import Register from '../components/Register.vue'
import Login from '../components/Login.vue'
import EditProfile from '@/components/EditProfile.vue';
import ItemPage from '@/components/ItemPage.vue';
import AddItem from '@/components/AddItem.vue';
import ExchangeProposals from '@/components/ExchangeProposals.vue';
import UserItemsById from '@/components/UserItemsById.vue';
import UserItemsByIdChoose from '@/components/UserItemsByIdChoose.vue';
import EditItem from '@/components/EditItem.vue';
import LikedItemsPage from '@/components/LikedItemsPage.vue';

const routes = [
{
  path: "/",     
  name: "Home",     
  component: HomePage,
  },
{
  path: "/register",     
  name: "Register",     
  component: Register,
},
{
  path: "/login",     
  name: "Login",     
  component: Login,
},
{
  path: "/profile",
  name: "profile",
  component: EditProfile,
},
{
  path: '/item/:id',
  name: "item",
  component: ItemPage,
  props: true
},
{
  path: '/add',
  name: "add",
  component: AddItem,
  props: true
},
{
  path: '/useritems/:userId',
  name: 'UserItemsById',
  component: UserItemsById,
  props: true
},
{
  path: '/selectuseritems/:userId',
  name: 'SelectUserItems',
  component: UserItemsByIdChoose,
  props: true
},
{
  path: '/exchangeproposals',
  name: "exchangeproposals",
  component: ExchangeProposals
},
{
  path: '/edit/:id',
  name: "edit",
  component: EditItem,
},
{
  path: '/likeditems',
  name: "likeditems",
  component: LikedItemsPage
}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
