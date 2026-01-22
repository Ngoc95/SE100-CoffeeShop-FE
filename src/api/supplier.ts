import axiosClient from './axiosClient'

export const getSuppliers = (params?: Record<string, any>) => {
    return axiosClient.get('/suppliers', { params })
}

export const getSupplierCategories = (params?: Record<string, any>) => {
    return axiosClient.get('/suppliers/categories', { params })
}

export const deleteSupplier = (id: number) => {
    return axiosClient.delete(`/suppliers/${id}`)
}

export const createSupplier = (
    name: string,
    contactPerson: string,
    phone: string,
    email: string,
    address: string,
    city: string,
    category: string,
    status: string
) => {
    const params = {
        name,
        contactPerson,
        phone,
        email,
        address,
        city,
        category,
        status
    }
    return axiosClient.post('/suppliers', params)
}

export const updateSupplier = (
    id: number,
    name?: string,
    contactPerson?: string,
    phone?: string,
    email?: string,
    address?: string,
    city?: string,
    category?: string,
    status?: string
) => {
    let params: Record<string, any> = {
        "name": name,
        "contactPerson": contactPerson,
        "phone": phone,
        "email": email,
        "address": address,
        "city": city,
        "category": category,
        "status": status
    }
    console.log("Edit params: ", params)
    return axiosClient.patch(`/suppliers/${id}`, params)
}