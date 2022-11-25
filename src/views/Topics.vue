<template>
    <span v-if="!db">Loading</span>
    <Panel v-else>
        <div id="panel">
            <div class="panel-field search">
                <button @click="getTopics(searchText)"><v-icon name="fa-search" scale="0.8"/></button>
                <Field v-model="searchText" name="" @enter="getTopics(searchText)"/>
            </div>
            <div class="panel-field states">
                <label for="states">States</label>
                <select @change="selectByState" v-model="filterState" name="states">
                    <option value="">All</option>
                    <option :value="TopicState.ACTIVE">Active</option>
                    <option :value="TopicState.DISABLED">Disabled</option>
                </select>
            </div>
            <div v-if="dates.length > 0" class="panel-field">
                <label for="dates">Date created</label>
                <select name="dates">
                    <option v-for="date in dates" :value="date">{{date}}</option>
                </select>
            </div>
        </div>
        <Table :columns="['ID', 'Name', 'Date Created', 'State', 'Actions']">
            <template #body>
                <tr>
                    <td>-</td>
                    <td><input maxlength="50" v-model="activeTopic.name" type="text"></td>
                    <td>-</td>
                    <td>
                        <select v-model="activeTopic.state" name="states">
                            <option :value="TopicState.DISABLED">DISABLED</option>
                            <option :value="TopicState.ACTIVE">ACTIVE</option>
                        </select>
                    </td>
                    <td>
                        <button @click="addTopic">Add topic</button>
                    </td>
                </tr>
                <tr v-for="topic in topics">
                    <td>{{topic.id}}</td>
                    <td>
                        <input v-if="topic.editing" type="text" v-model="topic.name">
                        <span v-else>{{topic.name}}</span>
                    </td>
                    <td>{{topic.created}}</td>
                    <td>
                        <select v-if="topic.editing" v-model="topic.state" name="states">
                            <option :value="TopicState.DISABLED">DISABLED</option>
                            <option :value="TopicState.ACTIVE">ACTIVE</option>
                        </select>
                        <span v-else>{{TopicState[topic.state]}}</span>
                    </td>
                    <td>
                        <button @click="updateTopic(topic)" v-if="topic.editing">Save</button>
                        <Dropdown v-else label="Select">
                            <div @click="() => topic.editing = !topic.editing" class="dropdown-item"><v-icon name="fa-edit" scale="0.8"/> Edit</div>
                            <div @click="transition(topic.id!, topic.state)" class="dropdown-item"><v-icon name="fa-check" scale="0.8"/> Transition</div>
                            <div @click="deleteTopic(topic.id)" class="dropdown-item"><v-icon name="fa-trash" scale="0.8"/> Delete</div>
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
import Field from "../components/Field.vue";
import Panel from "../components/Panel.vue";
import { ref, onMounted } from 'vue';
import SQLite from 'tauri-plugin-sqlite-api';
import {Topic, TopicState} from "../types";
import {format} from "date-fns";

let db = ref<SQLite | null>(null);
let topics = ref<Topic[]>([]);
let activeTopic = ref<Topic>({
    name: "",
    state: TopicState.DISABLED
})
let searchText = ref("");
let filterState = ref("");
let dates = ref<string[]>([]);

onMounted(async () => {
    db.value = await SQLite.open("./main.sqlite");
    await getTopics();
})

async function getDates() {
    dates.value = [...new Set(topics.value.map(topic => topic.created!))];
}

async function getTopics(search?: string) {
    if (!search) {
        topics.value = await db.value?.select<Array<Topic>>(`
            SELECT * FROM topics;
        `) || [];
    } else {
        topics.value = await db.value?.select<Array<Topic>>(`SELECT * FROM topics WHERE name LIKE '%${search}%';`) || [];
    }

    await getDates()
}

async function addTopic() {
    if (activeTopic.value.name) {
        let newTopic: Topic = {
            name: activeTopic.value.name,
            state: activeTopic.value.state,
            created: format(new Date(), "dd/MM/yyyy")
        }
    
        await db.value?.execute(`
            INSERT INTO topics (name, created, state) VALUES (?1, ?2, ?3)
        `, [newTopic.name, newTopic.created, newTopic.state.toString()])
    
        await getTopics();
    }
}

async function deleteTopic(id: number| undefined) {
    await db.value?.execute(`DELETE FROM topics WHERE id = ?`, [id])
    await getTopics();
}

async function transition(id: number, state: number) {
    try {
        await db.value?.execute(`
        UPDATE topics SET state = ${state == 0 ? 1 : 0} WHERE id = ?
    `, [id])
    } catch (e) {
        alert(e)
    }
    

    await getTopics();
}

async function updateTopic(topic: Topic) {
    await db.value?.execute(`
        UPDATE topics SET 
        name = ?1,
        state = ?2
        WHERE id = ?3;
    `, [topic.name, topic.state, topic.id])

    topic.editing = false;
}

async function selectByState() {
    if (filterState.value !== "") {
        topics.value = await db.value?.select<Array<Topic>>(`
            SELECT * FROM topics WHERE state = ?
        `, [filterState.value]) || []
    } else {
        await getTopics(searchText.value);
    }
}


</script>

<style scoped>
#topics {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
}

#panel {
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