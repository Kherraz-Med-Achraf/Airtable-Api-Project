import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/TheHome.vue';
import TheLogin from './components/TheLogin.vue';


const routes = [
  { path: '/', component: Home },
  { path: '/login', component: TheLogin},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
