import  { combineReducers } from 'redux' ;

import authReducer from './auth' ;
import tokenReducer from './token' ;
import stakeReducer from './stake';
import orderReducer from './order';
import tradeReducer from './trade';

export default combineReducers({
    auth : authReducer,
    token : tokenReducer,
    stake : stakeReducer,
    order : orderReducer,
    trade : tradeReducer,
})