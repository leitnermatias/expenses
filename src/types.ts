export enum TopicState {
    DISABLED,
    ACTIVE
}

export enum TransactionType {
    EARNING,
    EXPENSE
}

export type Topic = {
    id?: number,
    created?: string,
    name: string,
    state: TopicState,
    editing?: boolean
}

export type Transaction = {
    id?: number,
    created?: string,
    topic?: number,
    editing?: Editable<Transaction>,
    currency?: number,
    type: number,
    name: string,
    cost: number,
}

export type Currency = {
    id?: number,
    editing?: Editable<Currency>,
    name: string,
    symbol: string
}

export type Editable<T> = {
    active: boolean,
    value: T
}
