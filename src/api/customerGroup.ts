import axiosClient from './axiosClient'

export const getCustomerGroups = (params?: Record<string, any>) => {
    return axiosClient.get('/customer-groups', { params })
}

export const deleteCustomerGroup = (id: number) => {
    return axiosClient.delete(`/customer-groups/${id}`)
}

export const updateCustomerGroup = (
    id: number,
    name?: string,
    description?: string,
    priority?: number,
    minSpend?: number,
    minOrders?: number,
    windowMonths?: number
) => {
    let params: Record<string, any> = {
        "name": name,
        "description": description,
        "priority": priority,
        "minSpend": minSpend,
        "minOrders": minOrders,
        "windowMonths": windowMonths
    }
    return axiosClient.patch(`/customer-groups/${id}`, params)
}