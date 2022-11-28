import SQLite from "tauri-plugin-sqlite-api";

export enum QueryType {
    SELECT,
    EXECUTE
}

export type Query = {
    type: QueryType,
    value: string
}


export function selectAndFilter(
    tableName: string,
    columns: string[],
    filters?: {column: string, value?: string | number, connector: string}[]
    ): Query {
    let queryString = `SELECT ${columns.join(',')} FROM ${tableName}`;
    
    if (filters) {
        filters.forEach(filter => {
            if (filter.value !== undefined) {
                const filterString = `${filter.column} ${filter.connector} '${filter.value}'` 
                queryString += queryString.includes('WHERE') ? ` AND ${filterString}` : ` WHERE ${filterString}`;
            }
        })
    }

    return {type: QueryType.SELECT, value: queryString};
}

export function remove(
    tableName: string,
    id: number
): Query {
    //TODO: implement filter
    return {type: QueryType.EXECUTE, value: `DELETE FROM ${tableName} WHERE id = '${id}'`}
}

export function add(
    tableName: string,
    values: (string | number | null | undefined)[]
): Query {
    let valuesString = ""

    values.forEach((value, index) => {
        const wrapString = typeof value === 'string'
        valuesString += index === values.length - 1 ? 
        `${wrapString ? '\'' : ''}${value}${wrapString ? '\'' : ''}` 
        : `${wrapString ? '\'' : ''}${value}${wrapString ? '\'' : ''}, `
    })

    let queryString = `INSERT INTO ${tableName} VALUES (${valuesString})`

    return {type: QueryType.EXECUTE, value: queryString};
}

export function update(
    tableName: string,
    columns: {name: string, value: string | number | undefined | null}[],
    id: number
): Query {
    let columnString = ""

    columns.forEach((column, index) => {
        const wrapString = typeof column.value === 'string';
        columnString += 
        index === columns.length - 1 ?
        `${column.name} = ${wrapString ? '\'' : ''}${column.value}${wrapString ? '\'' : ''}`
        : `${column.name} = ${wrapString ? '\'' : ''}${column.value}${wrapString ? '\'' : ''}, `
    })

    return {type: QueryType.EXECUTE, value: `UPDATE ${tableName} SET ${columnString} WHERE id = '${id}';`}
}

export async function dbCall<T>(query: Query, db?: SQLite | null): Promise<T | undefined> {
    if (db) {
        try {
            if (query.type == QueryType.EXECUTE) {
                await db.execute(query.value);
            }

            if (query.type == QueryType.SELECT) {
                const queryResult: T = await db.select<T>(query.value);
                return queryResult;
            }
        } catch (error) {
            alert(`
                Error: ${error}
                Query: ${query.value}
            `)
        }
    } else {
        alert('Error trying to reach database')
    }

}