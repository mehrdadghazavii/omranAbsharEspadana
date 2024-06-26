import {applyMiddleware, createStore, compose} from 'redux';
import reduxThunk from 'redux-thunk';
import {Reducer} from './reducer/reducer';

// @ts-ignore
const composeEnhancer = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

const store = createStore(Reducer, composeEnhancer(applyMiddleware(reduxThunk)));

export {store}