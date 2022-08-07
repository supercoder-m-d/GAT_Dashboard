import {configureStore} from '@reduxjs/toolkit';
import { toggler } from './reducer'
export default configureStore({
    reducer: {
        toggle: toggler.reducer,
    }
})