<template>
    <table>
        <thead>
            <slot name="head">
            </slot>
            <tr>
                <th v-for="column in columns">{{column}}</th>
            </tr>
        </thead>
        <tbody>
            <slot name="body"></slot>
        </tbody>
    </table>
</template>

<script setup lang="ts">

defineProps<{
    columns?: string[]
}>()

</script>

<style scoped>

</style>