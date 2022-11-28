<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import { store } from "./globals";
import SQLite from "tauri-plugin-sqlite-api";
import Navbar from "./components/Navbar.vue";
import {exists, BaseDirectory, writeBinaryFile, createDir} from "@tauri-apps/api/fs";
import {appDir} from "@tauri-apps/api/path";

onMounted(async () => {
  try {
    const dbExists = await exists('main.sqlite', {dir: BaseDirectory.App}) as unknown as boolean;
    const baseDirExists = await exists('', {dir: BaseDirectory.App}) as unknown as boolean;

    if (!baseDirExists) {
      await createDir('', {dir: BaseDirectory.App});
    }

    if (!dbExists) {
      await writeBinaryFile('main.sqlite', new Uint8Array([]),{dir: BaseDirectory.App});
    }

    const appDirPath = await appDir();

    store.db = await SQLite.open(appDirPath + "/main.sqlite");
    await store.db.execute(`
      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        state TEXT NOT NULL
      )
    `)

    await store.db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        created TEXT NOT NULL,
        cost REAL NOT NULL,
        type INTEGER NOT NULL,
        topic INTEGER NOT NULL,
        currency INTEGER NOT NULL,
        FOREIGN KEY (topic) REFERENCES topics (id),
        FOREIGN KEY (currency) REFERENCES currency (id)
      )
    `)

    await store.db.execute(`
      CREATE TABLE IF NOT EXISTS currency (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL
      )
    `)
    } catch (error) {
      alert(error)
    }
   
})

</script>

<template>
  <div class="main-container">
    <Navbar
      :routes="[
        {name: 'Home', path: '/', iconName: 'fa-home'},
        {name: 'Transactions', path: '/transactions', iconName: 'fa-money-bill-wave'},
        {name: 'Configuration', path: '/config', iconName: 'fa-toolbox'},
      ]"
    />
    
    <div v-if="store.db" id="routerview">
      <RouterView/>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  padding: 10px;
  height: 90%;
}

#routerview {
  width: 100%;
  padding: 10px;
  height: 100%;
}

#menu {
  width: fit-content;
  height: fit-content;
  position: sticky;
  top: 0;
  left: 0;
}

.menu-button {
  justify-self: end;
  align-self: start;
  color: var(--colorFour);
}

.menu-button:hover {
  color: var(--colorThree);
  cursor: pointer;
}


</style>
