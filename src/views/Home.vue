<template>
    <Panel>
        <div class="info">
            <p><b>Currencies:</b>  {{currencies.map(currency => currency.symbol).join(', ')}}</p>
            <p><b>Total transactions: </b> {{transactions.length}}</p>
            <p><b>Total expenses:</b> {{transactions.filter(t => t.type === TransactionType.EXPENSE).length}}</p>
            <p><b>Total earnings:</b> {{transactions.filter(t => t.type === TransactionType.EARNING).length}}</p>
        </div>
        <div class="container">
            <div class="chart">
                <BarChart 
                :data="{
                    labels: currencies.map(c => c.symbol),
                    datasets: [currencyTotals]
                }" />
            </div>
            <div>
                <BarChart
                :data="{
                    labels: ['Earnings', 'Expenses'],
                    datasets: transactionTotals
                }"
                />
            </div>
            
        </div>
    </Panel>
</template>

<script setup lang="ts">
import Panel from '../components/Panel.vue';
import BarChart from '../components/BarChart.vue';
import { selectAndFilter, dbCall } from '../service/database';
import { store } from '../globals';
import { onMounted, ref } from 'vue';
import { Currency, Transaction, TransactionType } from '../types';

type Dataset = {
    label: string,
    backgroundColor: string,
    data: number[]
}

const transactions = ref<Transaction[]>([])
const currencyTotals = ref<Dataset>({
    label: '',
    backgroundColor: '',
    data: []
})
const transactionTotals = ref<Dataset[]>([])
const currencies = ref<Currency[]>([])
const totalAmount = ref<number>(0);

onMounted(async () => {
    await getTransactions();
    await getCurrencies();
    calculateTransactionTotals(transactions.value);
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

    calculateCurrencyTotals(currencies.value)

}

function calculateCurrencyTotals(currencies: Currency[]) {
    let totals: Dataset = {
        label: 'Balance: ',
        backgroundColor: '',
        data: []
    }
    let color = 255;

    currencies.forEach(currency => {
        color = color <= 0 ? 255 : color - 20;
        const total = transactions.value
        .filter(transaction => transaction.currency === currency.id)
        .reduce((sumTotal, currentTransaction) => {
            if (currentTransaction.type == TransactionType.EARNING) {
                sumTotal += currentTransaction.cost
            } else {
                sumTotal -= currentTransaction.cost
            }

            return sumTotal
        }, 0)

        totals.backgroundColor = `rgb(${color - 100}, ${color - 100}, ${color})`

        totals.data.push(total)
        
    })

    currencyTotals.value = totals;
}

function calculateTransactionTotals(transactions: Transaction[]) {
    let totals: Dataset[] = [];

    currencies.value.forEach(currency => {
        
        const totalEarnings = transactions
        .filter(transaction => transaction.type == TransactionType.EARNING && transaction.currency === currency.id)
        .reduce((sumTotal, currentTransaction) => sumTotal += currentTransaction.cost, 0)
    
        const totalExpenses = transactions
        .filter(transaction => transaction.type == TransactionType.EXPENSE && transaction.currency === currency.id)
        .reduce((sumTotal, currentTransaction) => sumTotal += currentTransaction.cost, 0)
    
        totals.push({
            label: `Transactions ${currency.symbol}`,
            backgroundColor: `rgb(0,0,190)`,
            data: [totalEarnings, totalExpenses]
        })
    
        // totals.push({
        //     label: `Expenses ${currency.symbol}`,
        //     backgroundColor: `rgb(0,0,100)`,
        //     data: [totalExpenses]
        // })
    })

    transactionTotals.value = totals;
}



</script>

<style scoped>
.container {
    display: grid;
    grid-template-columns: 45% 45%;
    gap: 15px;
    justify-content: center;
}

.info {
    display: grid;
    grid-template-columns: repeat(4, auto);
    margin-left: 20px;
}

.info > p {
    border-left: 2px solid var(--colorFive);
    padding-left: 5px;
}
</style>