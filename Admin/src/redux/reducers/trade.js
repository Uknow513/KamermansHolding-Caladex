
import ActionTypes from '../actions/actionTypes' ;

const INITIAL_STATE = {
    tradesData : [],
    error: {},
}

export default ( state={INITIAL_STATE} , action={} ) => {
    switch(action.type) {
        case (ActionTypes.GetTradeList):
            return ({
                ...state,
                tradesData : action.payload,
            });
        case ActionTypes.GetTradeListError:
            return ({
                ...state,
                error: action.payload
            });
        default :
            return state ;
    }
}