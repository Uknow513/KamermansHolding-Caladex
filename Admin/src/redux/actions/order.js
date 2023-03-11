


import ActionTypes from './actionTypes' ;
import axios from 'axios';
import { setItem } from '../../utils/helper';
import * as config from '../../static/constants';
import { getItem } from '../../utils/helper';
// import { getItem } from '../../utils/helper';
// import { useNavigate } from 'react-router-dom';


export const GetOrderList = (data) => async dispatch => {
    try {
        let res = await axios.post(`${config.BACKEND_API_URL}order/search`, { ...data });
        console.log(res);
        if(res.status === 200){
            dispatch({
                type: ActionTypes.GetOrderList,
                payload: res.data.data.data
            });
        }
    } catch (err) {
        console.log(err);
        dispatch({
            type: ActionTypes.GetOrderListError,
            payload: err
        });
    }
}
