import {createStore, combineReducers, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga'
import { takeEvery } from 'redux-saga'

import * as effect from 'redux-saga/effects';

import {FakeApi} from './fixture';

const INITIAL_API_STATE={pending: 0, failed: 0, fetched: {}};

const sagaMiddleware = createSagaMiddleware();

const store = createStore(combineReducers ({
  api: (state=INITIAL_API_STATE, action) => {
    switch (action.type) {
      case 'started':
        return Object.assign({}, state, {pending: state.pending + 1});
      case 'received':
        const data = action.data;
        console.log('RECEIVED', data);
        const fetched = Object.assign({},
                                      state.fetched,
                                      {[data.id]: data});
        return Object.assign({}, state, {pending: state.pending - 1,
                                         fetched: fetched});
      case 'failed':
        return Object.assign({}, state, {pending: state.pending - 1,
                                         failed: state.failed + 1});
    }
    return state;
  },
}), applyMiddleware(sagaMiddleware));

store.subscribe (() => {
  const state = store.getState()
  console.log('RENDER', JSON.stringify(state, null, 2));
})

function *handleFetching(action) {
  try {
    store.dispatch({type: 'started', pending: action.ident})
    const who = yield effect.call(FakeApi.fetch, action.ident)
    console.log(`fetched ${who.name}`, who);
    store.dispatch({type: 'received', data: who})
    if (who.friends.length > 0) {
      console.log('RECUR..', who.friends);
      for(const friend of who.friends) {
        // NB: Recursive action FTW!
        store.dispatch({type: 'fetch!', ident: friend})
      }
    }
  } catch (e) {
    console.log(`FAILED ${e}`);
    store.dispatch({type: 'failed', failures: {[action.ident]: e}})
  }
}

function *mySaga() {
  yield *takeEvery('fetch!', handleFetching)
}

sagaMiddleware.run(mySaga);

store.dispatch({type: 'fetch!', ident: '1'})
