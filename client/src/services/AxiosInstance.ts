import axios from "axios";

const AxiosInstance = axios.create({
    baseURL: import.meta.env.DEV
        ? "/api"
        : "http://localhost/RNLPROJECT/server/public/api",
});

AxiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    config.headers['Accept'] = 'application/json'
    config.headers['X-Requested-With'] = 'XMLHttpRequest'

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
    } else if (config.data !== undefined) {
        config.headers['Content-Type'] = 'application/json';
    }

    return config
})

AxiosInstance.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const status = error.response?.status;
        if (status !== undefined && status !== 422) {
            console.error("Unexpected response error: ", error);
        }

        return Promise.reject(error);
    }
);


export default AxiosInstance;