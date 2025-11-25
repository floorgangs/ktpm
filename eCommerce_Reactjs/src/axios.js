import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,

    //  withCredentials: true
});
if (localStorage.getItem("token")) {
    instance.interceptors.request.use(
        (config) => {
            config.headers.authorization =
                "Bearer " + localStorage.getItem("token").replaceAll('"', "");

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
}

instance.interceptors.response.use((response) => {
    // Thrown error for request with OK status code
    return response.data;
});

// Log network / axios errors with request URL to help debugging Network Error
instance.interceptors.response.use(undefined, (error) => {
    try {
        const req = error && error.config ? error.config.url || error.config.baseURL || '' : '';
        // eslint-disable-next-line no-console
        console.error('[axios] request failed:', req, error && error.message, error && error.response && error.response.status);
    } catch (e) {
        // ignore
    }
    return Promise.reject(error);
});

export default instance;
