<template>
    <div>
        <Bar
        :styles="{width: '400px', height: '400px'}"
        :chart-data="data"
        >
        </Bar>
    </div>
</template>

<script setup lang="ts">
import {Bar} from "vue-chartjs"
import { Chart as ChartJS, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Tooltip, BarElement, CategoryScale, LinearScale)

defineProps<{
    data: {
        labels: string[],
        datasets: {label?: string, backgroundColor?: string, data: number[]}[]
    }
}>()

</script>

<style scoped>

</style>