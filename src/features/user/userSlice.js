import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";


const getUserFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('user')) || null;
}

const initialState = {
    user: getUserFromLocalStorage(),
    theme: 'dracula',
};


const userSlice = createSlice({
    name: 'user', 
    initialState, 
    reducers:{
        loginUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
            toast.success("Logged in");
        },
        logoutUser: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            toast.success('Logged out successfully')
        }
    }
})

export const {loginUser, logoutUser} = userSlice.actions;

export default userSlice.reducer