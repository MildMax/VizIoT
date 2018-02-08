import {analyzeApi, analyzeApiKeys} from '../data/api/analyzeApi'
import { createAction } from 'redux-act'

export const startAnalyze = createAction()
export const successAnalyze = createAction()
export const failureAnalyze = createAction()

export const analyzeAggregationByTime = (networkId, deviceId, bucketConfig, startMS, endMS) => {
  startAnalyze()
  return new Promise(resolve => {

    const {call, requestRecord} = analyzeApi[analyzeApiKeys.analyzeAggregationByTime]

    call(new requestRecord({
      forDevice: deviceId,
      ...bucketConfig.
        startMS,
      endMS,
    }), networkId)
      .then(resolve)
      .catch((error) => {
        console.log(`failed to aggregateDataByTime for ${deviceId}: ${error}`)
        failureAnalyze()
      })
  }).then(res => {
      console.log(`successfully aggregateDataByTime for ${deviceId}`)
      successAnalyze({payload: res.data, deviceId, bucketConfig})
    }
  )
}