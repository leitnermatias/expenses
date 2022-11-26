<template>
    <Panel id="container">
        <div class="widget">
            <h3>Currency</h3>
            <Table :columns="['Name', 'Symbol', 'Actions']">
                <template #body>
                    <tr>
                        <td>
                            <Field v-model="activeCurrency.name" />
                        </td>
                        <td>
                            <Field v-model="activeCurrency.symbol" />
                        </td>
                        <td>
                            <v-icon @click="addCurrency" class="icon" name="fa-plus" :scale="0.8"></v-icon>
                        </td>
                    </tr>
                    <tr v-for="currency in currencies">
                        <td>
                            <input v-if="currency.editing?.active" v-model="currency.editing.value.name" type="text">
                            <span v-else>{{currency.name}}</span>
                        </td>
                        <td>
                            <input v-if="currency.editing?.active" v-model="currency.editing.value.symbol" type="text">
                            <span v-else>{{currency.symbol}}</span>
                        </td>
                        <td>
                            <div class="edit-panel" v-if="currency.editing?.active">
                                <button @click="cancelEdit(currency)" class="dropdown-item"><v-icon name="fa-times" scale="0.8"/> Cancel</button>
                                <button @click="updateCurrency(currency)" class="dropdown-item"><v-icon name="fa-check" scale="0.8"/> Save</button>
                            </div>
                            <Dropdown v-else label="Select">
                                <div @click="enableEdit(currency)" class="dropdown-item"><v-icon name="fa-edit" scale="0.8"/> Edit</div>
                                <div @click="deleteCurrency(currency.id!)" class="dropdown-item"><v-icon name="fa-trash" scale="0.8"/> Delete</div>
                            </Dropdown>
                        </td>
                    </tr>
                </template>
            </Table>
        </div>
        <div class="widget">
            <h3>Topics</h3>
            <Table :columns="['Name', 'State', 'Actions']">
                <template #body>
                    <tr>
                        <td><Field v-model="activeTopic.name"/></td>
                        <td>
                            <select v-model="activeTopic.state">
                                <option :value="TopicState.ACTIVE">Active</option>
                                <option :value="TopicState.DISABLED">Disabled</option>
                            </select>
                        </td>
                        <td>
                            <v-icon @click="addTopic" class="icon" name="fa-plus" :scale="0.8"></v-icon>
                        </td>
                    </tr>
                    <tr v-for="topic in topics">
                        <td>
                            <span>{{topic.name}}</span>
                        </td>
                        <td>
                            <span>{{TopicState[topic.state]}}</span>
                        </td>
                        <td>
                            <Dropdown label="Select">
                                <div @click="deleteTopic(topic)" class="dropdown-item"><v-icon name="fa-trash" scale="0.8"/> Delete</div>
                            </Dropdown>
                        </td>
                    </tr>
                </template>
            </Table>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Panel from '../components/Panel.vue';
import Table from '../components/Table.vue';
import Field from '../components/Field.vue';
import Dropdown from '../components/Dropdown.vue';
import { selectAndFilter, remove, add, update } from '../service/database';
import { Currency, Topic, TopicState } from '../types';
import {store} from "../globals";

const currencies = ref<Currency[]>([])
const topics = ref<Topic[]>([]);
const activeCurrency = ref<Currency>({
    name: "",
    symbol: "",
})
const activeTopic = ref<Topic>({
    name: "",
    state: TopicState.ACTIVE
})


onMounted(async () => {
    await getCurrencies();
    await getTopics();
})

async function getCurrencies() {
    const currencyQuery = selectAndFilter(
        'currency',
        ['*']
    )

    currencies.value = await store.db!.select<Currency[]>(currencyQuery) || [];
    currencies.value.forEach(currency => currency.editing = {active: false, value: {name: currency.name, symbol: currency.symbol}})
}

async function getTopics() {
    const query = selectAndFilter(
        'topics',
        ['*']
    )

    topics.value = await store.db!.select<Topic[]>(query);
}

async function addCurrency() {
    if (activeCurrency.value.name && activeCurrency.value.symbol) {
        const newCurrency: Currency = {
            name: activeCurrency.value.name,
            symbol: activeCurrency.value.symbol
        }

        const addQuery = add('currency', 3)

        await store.db!.execute(addQuery,
        [
            null,
            newCurrency.name,
            newCurrency.symbol,
        ])
    
        await getCurrencies();
    }
}

async function deleteCurrency(id: number) {
    const deleteQuery = remove('currency', id);

    await store.db!.execute(deleteQuery);
    await getCurrencies();
}

async function enableEdit(currency: Currency) {
    currency.editing!.active = true;
}

async function cancelEdit(currency: Currency) {
    currency.editing!.active = false;
    currency.editing!.value = {
        name: currency.name,
        symbol: currency.symbol
    }
}

async function updateCurrency(currency: Currency) {
    if (currency.editing!.value.name && currency.editing!.value.symbol) {
        currency.name = currency.editing!.value.name;
        currency.symbol = currency.editing!.value.symbol;
        
        const updateQuery = update(
            'currency',
            ['name', 'symbol'],
            currency.id!
        )

        await store.db!.execute(updateQuery,
        [
            currency.name,
            currency.symbol,
        ])

        await getCurrencies();
    }
}

async function addTopic() {
    if (activeTopic.value.name && activeTopic.value.state) {
        const newTopic: Topic = {
            name: activeTopic.value.name,
            state: activeTopic.value.state
        } 

        const addQuery = add('topics', 3);

        await store.db!.execute(
            addQuery,
            [
                null,
                newTopic.name,
                newTopic.state
            ]
        )

        await getTopics()
    }
}

async function deleteTopic(topic: Topic) {
    const deleteQuery = remove('topics', topic.id!);

    await store.db!.execute(deleteQuery);

    await getTopics();
}

</script>

<style scoped>

#container {
    display: flex;
    gap: 10px;
    justify-content: center;
}
.widget {
    width: 45%;
    max-height: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--colorThree);
    border: 1px solid var(--colorFour);
    overflow-y: auto;
}

.widget > h3 {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid var(--colorFive);
    background-color: var(--colorOne);
    margin: 0px;
    margin-bottom: 10px;
}

.icon {
    cursor: pointer;
}
</style>