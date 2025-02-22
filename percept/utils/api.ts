import axios from 'axios';

const BASE_URL = "https://perceptbackend.azurewebsites.net/api";

export const createApiInstance = (token: string) => {
    const instance = axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return instance;
};