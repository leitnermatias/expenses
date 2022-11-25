import Transactions from "../views/Transactions.vue"
import Home from "../views/Home.vue"
import Topics from "../views/Topics.vue"
import Config from "../views/Config.vue"

export default [
    {
        path: "/",
        component: Home
    },
    {
        path: "/topics",
        component: Topics
    },
    {
        path: "/transactions",
        component: Transactions
    },
    {
        path: "/config",
        component: Config
    }
]