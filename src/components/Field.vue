<template>
    <div>
        <label :for="name">{{name}}</label>
        <input 
        :type="type || 'text'" 
        :value="modelValue" 
        @input="updateValue(($event!.target! as HTMLInputElement).value)"
        @keyup.enter="$emit('enter')"
        :maxlength="maxlength"
        >
    </div>
</template>

<script setup lang="ts">
defineProps<{
    name?: string,
    modelValue: string,
    type?: string,
    maxlength?: string
}>()

const emit = defineEmits(['update:modelValue'])

function updateValue(value: string) {
    emit('update:modelValue', value)
}

</script>

<style scoped>
div {
    display: flex;
    flex-direction: column;
    margin: 4px;
}

label {
    font-size: 14px;
    color: var(--colorSix)
}
</style>