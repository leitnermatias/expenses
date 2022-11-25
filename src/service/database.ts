export function selectAndFilter(
    tableName: string,
    columns: string[],
    filters?: {column: string, value?: string | number, connector: string}[]
    ): string {
    let queryString = `SELECT ${columns.join(',')} FROM ${tableName}`;
    
    if (filters) {
        filters.forEach(filter => {
            if (filter.value !== undefined) {
                const filterString = `${filter.column} ${filter.connector} '${filter.value}'` 
                queryString += queryString.includes('WHERE') ? ` AND ${filterString}` : ` WHERE ${filterString}`;
            }
        })
    }

    return queryString;
}

export function remove(
    tableName: string,
    id: number
): string {
    //TODO: implement filter
    return `DELETE FROM ${tableName} WHERE id = '${id}'`
}

export function add(
    tableName: string,
    valuesLength: number
) {
    let valuesString = ""

    Array.from({length: valuesLength}, (x, i) => i + 1)
    .forEach(i => {
        valuesString += i === valuesLength ? `?${i}` : `?${i}, `
    })

    let queryString = `INSERT INTO ${tableName} VALUES (${valuesString})`

    return queryString;
}