import axios from 'axios';
import { headers, baseUrl } from '../../constants/RequestConstants';
import { Record } from 'immutable';
import DataReducerTypes from '../../constants/DataReducerTypes';
import AnalyticsRequest from '../records/AnalyticsRequest';
import GeoDimension from '../dimensions/GeoDimension';
import { ConnectionMetric } from '../metrics/ConnectionMetric';
import { DateConstants } from '../../constants/DateConstants';
import { convertDateTypeToString } from '../../utility/TimeUtility';
import DeviceDimension from '../dimensions/DeviceDimension';

const postCallWithRecord = (payloadRecord, url) => {
  return axios({
    method: 'post',
    url,
    headers,
    data: payloadRecord.toJS(),
  });
};

const analyzeAggregationCore = payloadRecord => {
  return postCallWithRecord(payloadRecord, `${baseUrl}/api/analyze/core`);
};

const analyzeAggregationByTime = (payloadRecord, networkId) => {
  return postCallWithRecord(
    payloadRecord,
    `${baseUrl}/api/networks/${networkId}/analyze/aggregateDataByTime`
  );
};

const analyzeAggregationByLocation = payloadRecord => {
  return analyzeAggregationCore(payloadRecord);
};

const analyzeAggregationByDevice = (payloadRecord, networkId) => {
  return postCallWithRecord(
    payloadRecord,
    `${baseUrl}/api/networks/${networkId}/analyze/aggregateDataByDevice`
  );
};

export const analyzeApiKeys = {
  CORE: 'analyzeAggregationCore',
  BY_TIME: 'analyzeAggregationByTime',
  BY_LOCATION: 'analyzeAggregationByLocation',
  BY_DEVICE: 'analyzeAggregationByDevice',
};

export const analyzeApi = {
  // Within a time range: for each device, for each time unit, give me a tally for [bucketProps]
  [analyzeApiKeys.BY_TIME]: {
    call: analyzeAggregationByTime,
    REQUEST_RECORD: new Record({
      selectionMode: DataReducerTypes.COMBINED,
      macAddresses: [],
      bucketSize: 1,
      bucketProps: [],
      startMS: 0,
      endMS: 0,
    }),
  },

  // Within a time range: for each device, for each location, give me a tally for [bucketProps]
  [analyzeApiKeys.BY_LOCATION]: {
    call: analyzeAggregationByLocation,
    REQUEST_RECORD: new AnalyticsRequest({
      dimensions: [GeoDimension.DOMAIN],
      metrics: [ConnectionMetric.HITS],
      reducer: DataReducerTypes.INDIVIDUAL,
      startTime: convertDateTypeToString[DateConstants.TODAY](),
      endTime: convertDateTypeToString[DateConstants.NOW](),
    }),
  },

  [analyzeApiKeys.CORE]: {
    call: analyzeAggregationCore,
    REQUEST_RECORD: new AnalyticsRequest({
      dimensions: [],
      metrics: [ConnectionMetric.HITS],
      reducer: DataReducerTypes.INDIVIDUAL,
      startTime: convertDateTypeToString[DateConstants.TODAY](),
      endTime: convertDateTypeToString[DateConstants.NOW](),
    }),
  },

  // Within a time range: for each device, give me a tally for [bucketProps]
  [analyzeApiKeys.BY_DEVICE]: {
    call: analyzeAggregationByDevice,
    REQUEST_RECORD: new AnalyticsRequest({
      dimensions: [DeviceDimension.MAC],
      metrics: [ConnectionMetric.HITS],
      reducer: DataReducerTypes.COMBINED,
      startTime: convertDateTypeToString[DateConstants.TODAY](),
      endTime: convertDateTypeToString[DateConstants.NOW](),
    }),
  },
};