<template>
    <Panel>
        <div class="container">
            <BarChart :data="{
                labels: ['Transactions by Currency'],
                datasets: currencyTotals
            }" />
        </div>
    </Panel>
</template>

<script setup lang="ts">
import Panel from '../components/Panel.vue';
import BarChart from '../components/BarChart.vue';
import { selectAndFilter, dbCall } from '../service/database';
import { store } from '../globals';
import { onMounted, ref } from 'vue';
import { Currency, Transaction } from '../types';

const transactions = ref<Transaction[]>([])
const currencyTotals = ref<{label: string, data: number[]}[]>([])
const currencies = ref<Currency[]>([])

onMounted(async () => {
    await getTransactions();
    await getCurrencies();
})

async function getTransactions() {
    const transactionsQuery = selectAndFilter(
        'transactions',
        ['*']
    )

    transactions.value = await dbCall<Transaction[]>(transactionsQuery, store.db) || [];
}

async function getCurrencies() {
    const query = selectAndFilter(
        'currency',
        ['*']
    )

    currencies.value = await dbCall(query, store.db) || [];

    let totals: {label: string, data: number[]}[] = []

    currencies.value.forEach(currency => {
        const total = transactions.value
        .filter(transaction => transaction.currency === currency.id)
        .reduce((sumTotal, currentTransaction) => sumTotal + currentTransaction.cost, 0)

        totals.push({
            label: currency.symbol,
            data: [total]
        })
    })

    currencyTotals.value = totals;
}



</script>

<style scoped>
.container {
    display: flex;
    gap: 50px;
    justify-content: center;
}
</style>