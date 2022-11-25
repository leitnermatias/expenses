import SQLite from "tauri-plugin-sqlite-api";
import { reactive, ref, onMounted, onUnmounted } from "vue";

export const store = reactive<{
    db: SQLite | null
}>({
    db: null
})