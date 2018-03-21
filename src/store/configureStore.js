import { createStore, combineReducers } from 'redux';
import devices from '../reducers/devices/devices';
import aggregateSample from '../reducers/aggregateSampleReducer';
import {
  startAnalyze,
  successAnalyze,
  failureAnalyze,
  startCoreAnalyze,
  successCoreAnalyze,
  failureCoreAnalyze,
  startAnalyzeDevice,
  successAnalyzeDevice,
  failureAnalyzeDevice,
} from '../actions/analyzeActions';
import {
  startFetchDevices,
  successFetchDevices,
  failureFetchDevices,
} from '../actions/deviceActions';
import chartConfig from '../reducers/chartConfig';
import analytics from '../reducers/analytics/analytics';

// Store creation
export default () => {
  const store = createStore(
    combineReducers({
      devices,
      aggregateSample,
      chartConfig,
      analytics,
    }),
    // This is for Redux DevTools
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  startAnalyze.assignTo(store);
  successAnalyze.assignTo(store);
  failureAnalyze.assignTo(store);

  startCoreAnalyze.assignTo(store);
  successCoreAnalyze.assignTo(store);
  failureCoreAnalyze.assignTo(store);

  startAnalyzeDevice.assignTo(store);
  successAnalyzeDevice.assignTo(store);
  failureAnalyzeDevice.assignTo(store);

  startFetchDevices.assignTo(store);
  successFetchDevices.assignTo(store);
  failureFetchDevices.assignTo(store);

  return store;
};

// // Subscribe: returns a method that lets us unsubscribe in the future.
// const unsubscribe = store.subscribe(() => {
//   console.log(store.getState());
// });
//
// // After this, future calls to store will not trigger that one we set above.
// unsubscribe()