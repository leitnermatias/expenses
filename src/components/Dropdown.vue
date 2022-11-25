<template>
    <div @click="() => showMenu = !showMenu" id="dropdown" v-on-click-outside="() => showMenu = false">
        <button>
            <v-icon v-if="!showMenu" name="fa-caret-right"/>
            <v-icon v-else name="fa-caret-down"/>
            {{label}}
        </button>
        <div 
        v-if="showMenu" 
        id="dropdown-menu" 
        >
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { vOnClickOutside } from '@vueuse/components';

defineProps<{
    label: string
}>()

let showMenu = ref(false);
</script>

<style scoped>
#dropdown {
    width: 100%;
    background-color: var(--colorThree);
}

#dropdown-menu {
    position: absolute;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: start;
    width: fit-content;
}

:slotted(#dropdown-menu > .dropdown-item) {
    background-color: #fff;
    padding: 5px;
    width: 100%;
    text-align: left;
    box-shadow: 1px 1px 1px black;
    cursor: pointer;
    font-size: 12px;
    border-left: 2px solid var(--colorSix);
    border-bottom: 1px solid black;
}

:slotted(#dropdown-menu > .dropdown-item:hover) {
    border-left: 2px solid var(--colorOne);
    background-color: var(--colorThree);
}

:slotted(#dropdown-menu > .dropdown-item:last-of-type) {
    border-bottom: none;
}
</style>