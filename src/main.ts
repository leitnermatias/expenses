import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import {createRouter, createWebHistory} from "vue-router";
import routes from "./router"
import { OhVueIcon, addIcons } from "oh-vue-icons";
import * as FaIcons from "oh-vue-icons/icons/fa";


const Fa = Object.values({ ...FaIcons });
addIcons(...Fa);

const router = createRouter({
    history: createWebHistory(),
    routes
})

const app = createApp(App)
app.component("v-icon", OhVueIcon);
app.use(router)
app.mount("#app");
