import axios from 'axios';
import {BASE_URL} from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000;

axiosInstance.interceptors.request.use(
    (config)=>{
        const accessToken= localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization= `Bearer ${accessToken}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)

axiosInstance.interceptors.response.use(
    (response)=>{
        return response;
    },
    async (error)=>{
        const { config, response } = error;

        if (response && response.status === 503 && config) {
            config.retryCount = config.retryCount || 0;

            if (config.retryCount < MAX_RETRIES) {
                config.retryCount += 1;
                
                const backoffDelay = INITIAL_RETRY_DELAY_MS * Math.pow(2, config.retryCount - 1);
                console.warn(`[Axios] Gemini/Server busy (503). Retrying attempt ${config.retryCount}/${MAX_RETRIES} in ${backoffDelay}ms...`);
                
                await new Promise((resolve) => setTimeout(resolve, backoffDelay));
                
                return axiosInstance(config);
            }
        }

        if(response){
            if(response.status === 500){
                console.error("Server error, Please try again later");
            }
        } else if(error.code === 'ECONNABORTED'){
            console.error("Request timeout, Please try again later");
        }
        
        return Promise.reject(error);
    }
)

export default axiosInstance;
