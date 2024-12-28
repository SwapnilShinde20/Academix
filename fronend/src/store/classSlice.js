import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    status : false,
    classData : null
}

const classSlice = createSlice({
    name : 'class',
    initialState,
    reducers:{
        addClass: (state,action)=> {
            state.status = true,
            state.classData = action.payload
        },
        removeClass:(state,action)=>{
            state.status = false,
            state.classData = null
        }
    }
})

export const {addClass , removeClass} = classSlice.actions
export default classSlice.reducer