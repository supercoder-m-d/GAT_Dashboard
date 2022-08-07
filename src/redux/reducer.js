import { createSlice } from '@reduxjs/toolkit';

export const toggler = createSlice({
    name: 'toggleBg',
    initialState: {
        value: "false",
    },
    reducers: {
        toggleBg: (state, action) => {
            state.value = action.payload
        }
    }
})

export const { 
    toggleBg
} = toggler.actions