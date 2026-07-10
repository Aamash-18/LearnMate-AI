import axiosInstance from '../utils/axiosInstance';
import {API_PATHS} from '../utils/apiPaths';

export const login= async(email, password)=>{
    try{
        const response= await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
            email,
            password,
        })
        return response.data;
    }
    catch(error){
        const errorMsg = error.response?.data?.error || error.response?.data?.message || "Login failed. Please try again.";
        const err = new Error(errorMsg);
        throw err;
    }
}

const register= async(username, email, password)=>{
    try{
        const response= await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            username,
            email,
            password,
        })
        return response.data;
    }
    catch(error){
        // Extract error message from backend response
        const errorMsg = error.response?.data?.error || error.response?.data?.message || "Registration failed. Please try again.";
        const err = new Error(errorMsg);
        throw err;
    }
}

const getProfile= async()=>{
    try{
        const response= await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data;
    }
    catch(error){
        throw error.response?. data || "Failed to fetch profile. Please try again.";
    }
}

const updateProfile= async(userData)=>{
    try{
        const response= await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
        return response.data;
    }
    catch(error){
        throw error.response?. data || "Failed to update profile. Please try again.";
    }
}

const changePassword= async(passwords )=>{
    try{
        const response= await axiosInstance.put(API_PATHS.AUTH.CHANGE_PASSWORD, passwords);
        return response.data;
    }
    catch(error){
        throw error.response?. data || "Failed to change password. Please try again.";
    }
}


const authService={
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
}
export default authService;
