<template>
    <nav>
        <div v-for="route in routes"  class="menu">
            <router-link 
            :class="{active: $route.path === route.path}"
            class="nav-item"
            :to="route.path">
                <v-icon :color="$route.path === route.path ? '#2587f7' : ''" :name="route.iconName" />{{route.name}}
            </router-link>
            <div v-if="route.subRoutes" class="sub-items">
                <router-link 
                v-for="subRoute in route.subRoutes" 
                :class="{active: $route.path === subRoute.path}"
                :to="subRoute.path" 
                class="nav-item sub-item">
                    <v-icon :color="$route.path === subRoute.path ? '#2587f7' : ''" :name="subRoute.iconName"/> {{subRoute.name}}
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

type Route = {
    name: string,
    path: string,
    iconName: string,
    subRoutes?: Route[]
}

defineProps<{
    routes: Route[]
}>()
</script>

<style scoped>
nav {
    display: flex;
    flex-direction: column;
    width: fit-content;
    height: fit-content;
    background-color: var(--colorOne);
    box-shadow: 1px 1px 5px black;
    margin-top: 10px;
}
.active {
    background: var(--colorTwo);
}

.menu {
    display: flex;
    flex-direction: column;
}

.sub-items {
    padding-left: 10px;
}

.sub-item {
    font-size: 14px;
}

.nav-item {
    display: flex;
    text-decoration: none;
    color: var(--colorFive);
    border-bottom: 1px solid var(--colorFour);
    padding: 5px;
    align-items: center;
    gap: 5px;
}

.nav-item:last-of-type {
    border: none;
}
</style>