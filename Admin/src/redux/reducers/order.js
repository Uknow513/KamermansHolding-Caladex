
import ActionTypes from '../actions/actionTypes' ;

const INITIAL_STATE = {
    ordersData : [],
    error: {},
}

export default ( state={INITIAL_STATE} , action={} ) => {
    switch(action.type) {
        case (ActionTypes.GetOrderList):
            return ({
                ...state,
                ordersData : action.payload,
            });
        case ActionTypes.GetOrderListError:
            return ({
                ...state,
                error: action.payload
            });
        default :
            return state ;
    }
}