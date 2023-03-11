


import ActionTypes from './actionTypes' ;
import axios from 'axios';
import { setItem } from '../../utils/helper';
import * as config from '../../static/constants';
import { getItem } from '../../utils/helper';
// import { getItem } from '../../utils/helper';
// import { useNavigate } from 'react-router-dom';


export const GetTradeList = (data) => async dispatch => {
    try {
        let res = await axios.post(`${config.BACKEND_API_URL}trade/search`, { ...data });
        console.log(res);
        if(res.status === 200){
            dispatch({
                type: ActionTypes.GetTradeList,
                payload: res.data.data.data
            });
        }
    } catch (err) {
        console.log(err);
        dispatch({
            type: ActionTypes.GetTradeListError,
            payload: err
        });
    }
}
