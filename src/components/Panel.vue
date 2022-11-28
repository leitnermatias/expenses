<template>
    <div>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
div {
    border: 1px solid white;
    height: 100%;
    padding: 5px;
    background-color: var(--colorTwo);
    overflow: auto
}
</style>