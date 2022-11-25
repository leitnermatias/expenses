<template>
    <Panel>
        <div id="action-panel">
            <div class="panel-field search">
                <button><v-icon @click="getTransactions(searchText, topicFilter, typeFilter, dateFilter, currencyFilter)" name="fa-search" scale="0.8"/></button>
                <Field v-model="searchText" name="" @enter="getTransactions(searchText, topicFilter, typeFilter, dateFilter)"/>
            </div>
            <div class="panel-field">
                <label>Type</label>
                <select @change="getTransactions(searchText, topicFilter, typeFilter, dateFilter, currencyFilter)" v-model="typeFilter">
                    <option :value="undefined">All</option>
                    <option :value="TransactionType.EARNING">Earning</option>
                    <option :value="TransactionType.EXPENSE">Expense</option>
                </select>
            </div>
            <div class="panel-field">
                <label>Date created</label>
                <select @change="getTransactions(searchText, topicFilter, typeFilter, dateFilter, currencyFilter)" v-model="dateFilter">
                    <option :value="undefined">All</option>
                    <option v-for="date in dates" :value="date">{{date}}</option>
                </select>
            </div>
            <div class="panel-field">
                <label>Topic</label>
                <select @change="getTransactions(searchText, topicFilter, typeFilter, dateFilter, currencyFilter)" v-model="topicFilter">
                    <option :value="undefined">All</option>
                    <option v-for="topic in topics" :value="topic.id">{{topic.name}}</option>
                </select>
            </div>
            <div class="panel-field">
                <label>Currency</label>
                <select @change="getTransactions(searchText, topicFilter, typeFilter, dateFilter, currencyFilter)" v-model="currencyFilter">
                    <option :value="undefined">All</option>
                    <option v-for="currency in currencies" :value="currency.id">{{currency.name}}</option>
                </select>
            </div>
        </div>
        <Table :columns="['Name', 'Topic', 'Type', 'Date Created', 'Currency', 'Cost', 'Actions']">
            <template #body>
                <tr>
                    <td><input type="text" v-model="activeTransaction.name"></td>
                    <td>
                        <select v-if="topics.length > 0" v-model="activeTransaction.topic" style="width: 100%;">
                            <option v-for="topic in topics" :value="topic.id">{{topic.name}}</option>
                        </select>
                    </td>
                    <td>
                        <select v-model="activeTransaction.type">
                            <option :value="TransactionType.EARNING">Earning</option>
                            <option :value="TransactionType.EXPENSE">Expense</option>
                        </select>
                    </td>
                    <td>-</td>
                    <td>
                        <select v-model="activeTransaction.currency">
                            <option v-for="currency in currencies" :value="currency.id">{{currency.name}}</option>
                        </select>
                    </td>
                    <td><b>{{getSymbol(currencies, activeTransaction.currency)}}</b> <input v-model="activeTransaction.cost" type="number"></td>
                    <td>
                        <v-icon @click="addTransaction" class="icon" name="fa-plus" :scale="0.8"></v-icon>
                    </td>
                </tr>
                <tr v-for="transaction in transactions">
                    <td>
                        <input v-if="transaction.editing?.active" v-model="transaction.editing.value.name" type="text">
                        <span v-else>{{transaction.name}}</span>
                    </td>
                    <td>
                        <select v-if="transaction.editing?.active" v-model="transaction.editing.value.topic" style="width: 100%;">
                            <option v-for="topic in topics" :value="topic.id">{{topic.name}}</option>
                        </select>
                        <span v-else>{{topics.filter(topic => topic.id === transaction.topic!)[0].name}}</span>
                    </td>
                    <td>
                        <select v-if="transaction.editing?.active" v-model="transaction.editing.value.type">
                            <option :value="TransactionType.EARNING">Earning</option>
                            <option :value="TransactionType.EXPENSE">Expense</option>
                        </select>
                        <span v-else>{{TransactionType[transaction.type]}}</span>
                    </td>
                    <td>{{transaction.created}}</td>
                    <td>
                        <select v-if="transaction.editing?.active" v-model="transaction.editing!.value.currency">
                            <option v-for="currency in currencies" :value="currency.id">{{currency.name}}</option>
                        </select>
                        <span v-else>{{getSymbol(currencies, transaction.currency)}}</span>
                    </td>
                    <td>
                        <b>{{getSymbol(currencies, transaction.editing?.active ? transaction.editing?.value.currency : transaction.currency)}} </b>
                        <input v-if="transaction.editing?.active" v-model="transaction.editing.value.cost" type="number">
                        <span v-else>{{transaction.cost}}</span>
                    </td>
                    <td>
                        <!-- <Dropdown v-if="transaction.editing?.active" label="Select"> -->
                            <div class="edit-panel" v-if="transaction.editing?.active">
                                <button @click="cancelEdit(transaction)" class="dropdown-item"><v-icon name="fa-times" scale="0.8"/> Cancel</button>
                                <button @click="updateTransaction(transaction)" class="dropdown-item"><v-icon name="fa-check" scale="0.8"/> Save</button>
                            </div>
                        <!-- </Dropdown> -->
                        <Dropdown v-else label="Select">
                            <div @click="enableEdit(transaction)" class="dropdown-item"><v-icon name="fa-edit" scale="0.8"/> Edit</div>
                            <div @click="deleteTransaction(transaction.id!)" class="dropdown-item"><v-icon name="fa-trash" scale="0.8"/> Delete</div>
                        </Dropdown>
                    </td>
                </tr>
            </template>
        </Table>
    </Panel>
</template>

<script setup lang="ts">
import Table from '../components/Table.vue';
import Dropdown from '../components/Dropdown.vue';
import Panel from "../components/Panel.vue";
import Field from "../components/Field.vue";
import { onMounted, ref } from 'vue';
import {Currency, Transaction, TransactionType} from "../types";
import {format} from "date-fns";
import {store} from "../globals";
import { selectAndFilter } from '../service/database';

const transactions = ref<Transaction[]>([]);
const topics = ref<{name: string, id: number}[]>([]);
const currencies = ref<Currency[]>([]);
const activeTransaction = ref<Transaction>({
    name: "",
    cost: 0,
    type: TransactionType.EARNING,

});

const searchText = ref("");
const dates = ref<string[]>([])
const typeFilter = ref(undefined)
const topicFilter = ref(undefined)
const dateFilter = ref(undefined)
const currencyFilter = ref(undefined)


onMounted(async () => {
    await getTransactions();
})


async function getTransactions(search?: string, topicId?: number, typeId?: number, date?: string, currency?: number) {
    try {
        
        const topicsQuery = selectAndFilter(
            'topics',
            ['id', 'name'],
            [
                {column: 'state', connector: '=', value: '1'}
            ]
        )

        const currencyQuery = selectAndFilter(
            'currency',
            ['*']
        )
            
        const transactionsQuery = selectAndFilter(
            'transactions',
            ['*'],
            [
                {column: 'topic', connector: '=', value: topicId},
                {column: 'type', connector: '=', value: typeId},
                {column: 'created', connector: '=', value: date},
                {column: 'currency', connector: '=', value: currency},
                {column: 'name', connector: 'LIKE', value: search && search !== '' ? `%${search}%` : undefined},
            ]
        )
                
        topics.value = await store.db!.select<Array<{name: string, id: number}>>(topicsQuery) || [];
        transactions.value = await store.db!.select<Transaction[]>(transactionsQuery) || [];
        currencies.value = await store.db!.select<Currency[]>(currencyQuery) || [];

        transactions.value.forEach(transaction => transaction.editing = {active: false, value: transaction})
        dates.value = [...new Set(transactions.value.map(transaction => transaction.created!))];
    } catch (error) {
        alert(error)
    }
}

async function addTransaction() {
    if (activeTransaction.value.topic && activeTransaction.value.name && activeTransaction.value.currency) {
        let newTransaction: Transaction = {
            name: activeTransaction.value.name,
            cost: activeTransaction.value.cost,
            topic: activeTransaction.value.topic,
            type: activeTransaction.value.type,
            currency: activeTransaction.value.currency,
            created: format(new Date(), "dd/MM/yyyy")
        }
        try {
            await store.db!.execute("INSERT INTO transactions VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)", 
            [
                null, 
                newTransaction.name, 
                newTransaction.created, 
                newTransaction.cost, 
                newTransaction.type, 
                newTransaction.topic,
                newTransaction.currency
            ]
            )
            await getTransactions();
        } catch (e) {
            alert(e)
        }
    }
}

async function deleteTransaction(id: number) {
    try {
        await store.db!.execute(`
            DELETE FROM transactions WHERE id = ?
        `, [id])

        await getTransactions();
    } catch (error) {
        alert(error)
    }
}

function enableEdit(transaction: Transaction) {
    transaction.editing!.active = true;
    transaction.editing!.value = {
        name: transaction.name,
        cost: transaction.cost,
        type: transaction.type,
        topic: transaction.topic,
        currency: transaction.currency,
    };
}

function cancelEdit(transaction: Transaction) {
    transaction.editing!.active = false;
}

async function updateTransaction(transaction: Transaction) {
    
    transaction.name = transaction.editing!.value.name;
    transaction.type = transaction.editing!.value.type;
    transaction.topic = transaction.editing!.value.topic;
    transaction.cost = transaction.editing!.value.cost;

    await store.db!.execute(`
        UPDATE transactions SET 
        name = ?1,
        cost = ?2,
        type = ?3,
        topic = ?4
        WHERE id = ?5;
    `, [
        transaction.editing?.value.name, 
        transaction.editing?.value.cost, 
        transaction.editing?.value.type,
        transaction.editing?.value.topic,
        transaction.id
    ])

    transaction.editing!.active = false;
}

function getSymbol(values?: Currency[], id?: number): string {

    if (id && values) {
        const val = values.filter(val => val.id === id);
        if (val.length > 0) {
            return val[0].symbol
        }
    }

    return "";
}


</script>

<style scoped>
#main {
    display: flex;
    justify-content: center;
    width:100%;
}

.edit-panel {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

#action-panel {
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
}

.panel-field {
    display: flex;
    gap: 2px;
}


.search {
    gap: 0px;
    align-items: center;
}

.search > * {
    margin: 0px;
}
</style>