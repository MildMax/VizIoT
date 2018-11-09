'use es6';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Flex from 'UIBean/Flex';
import FlexSize from 'UIBean/FlexSize';
import BCard from 'UIBean/BCard';
import DeviceList from '../components/DeviceList';
import { fetchDevices } from '../actions/deviceActions';
import {
  analyzeAggregationByDevice,
  analyzeAggregationByDomain,
  requestAggregationByTime,
  analyzeAggregationCore,
} from '../actions/analyzeActions';
import moment from 'moment';
import { connect } from 'react-redux';
import {
  selectDeviceList,
  selectEntireNetwork,
  selectLastSeen,
  selectNumberOfConnections,
} from '../selectors/deviceSelectors';
import DeviceActivityChart from './DeviceActivityChart';
import {
  selectMainChartConfig,
  selectSingleDeviceChartConfig,
} from '../selectors/chartSelectors';
import { getDataKey } from '../utility/DataKey';
// import FlexWrapper from 'UIBean/FlexWrapper';
import { hasDataForKey } from '../selectors/aggregateSampleSelector';
import QuickFacts from './QuickFacts';
import SectionTitle from '../components/SectionTitle';
import styled from 'styled-components';
import ActivityFeed from '../components/ActivityFeed';
import { selectMostRecentDomains } from '../selectors/analyticsSelector';
import TimedSwitcher from 'UIBean/TimedSwitcher';
import { DateConstants } from '../constants/DateConstants';
import { convertDateTypeToString } from '../utility/TimeUtility';
import { analyzeApiKeys } from '../data/api/analyzeApi';
import { SPACING } from '../data/records/Spacing';
import ScheduleCard from './ScheduleCard';
import ActivitySidebar from 'VizIoT/components/ActivitySidebar';
import GridItem from 'UIBean/GridItem';
import DataTable from 'UIBean/DataTable';
import { closeSocket, createSocket, subscribeToTopic } from 'VizIoT/socket/subscribe';
import { H1, H2 } from 'UIBean/functional-css/TypographyStyles';

const DATA_REFRESH_DELAY_MS = 7 * 1000;
const LOG_REFRESH_DELAY_MS = 3 * 1000;
const DEVICE_HITS_REFRESH_DAY_MS = 15 * 1000;

const RightContentWrapper = styled.section`
  @media (min-width: 1200px) {
    // margin-left: 350px;
  }
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(12, [col-start] 1fr);
  grid-auto-rows: 24rem;
  grid-gap: 2rem;
`;

const Title = styled.div`
  ${H1}
  padding-bottom: 3rem;
  font-weight: 200;
`;

class OverviewTab extends Component {

  state = {
    trafficVelocityData: [{count : 20, startMS: 100}],
  };

  constructor(props) {
    super(props);

    createSocket();
    subscribeToTopic('/total/count/500ms', (err, message) => {
      console.log(message);
      this.setState({
        trafficVelocityData: [
          ...this.state.trafficVelocityData,
          message,
        ].slice(-140),
      })
    });
  }

  fetchCombinedTrafficData() {
    const { mainChartConfig, networkId } = this.props;
    const { bucketConfig, dataWindowSize, selectionMode } = mainChartConfig;
    const startMS = (
      moment()
        .subtract(Math.floor(dataWindowSize * 1.2), bucketConfig.bucketUnit)
        .valueOf() / 1000
    ).toString();
    const endMS = (moment().valueOf() / 1000).toString();
    requestAggregationByTime(
      networkId,
      selectionMode,
      [],
      bucketConfig,
      startMS,
      endMS
    );
  }

  fetchAllDeviceGraphs() {
    const { devices } = this.props;
    const { singleDeviceChartConfig, networkId } = this.props;

    const deviceIdList = devices.map(({ macAddr }) => macAddr);

    const {
      bucketConfig,
      dataWindowSize,
      selectionMode,
    } = singleDeviceChartConfig;

    const startMS = (
      moment()
        .subtract(Math.floor(dataWindowSize * 1.2), bucketConfig.bucketUnit)
        .valueOf() / 1000
    ).toString();
    const endMS = (moment().valueOf() / 1000).toString();
    requestAggregationByTime(
      networkId,
      selectionMode,
      deviceIdList,
      bucketConfig,
      startMS,
      endMS
    );
  }

  fetchTimestampToDomain = () => {
    analyzeAggregationCore(
      analyzeApiKeys.TIME_TO_LOG,
      convertDateTypeToString[DateConstants.N_SECONDS_AGO](360),
      convertDateTypeToString[DateConstants.NOW]()
    );
  };

  componentWillMount() {
    const { networkId } = this.props;

    closeSocket();

    // this.fetchCombinedTrafficData();
    //
    // // Fetch all the things.
    // fetchDevices(networkId);
    // this.fetchAllDeviceGraphs();
    // analyzeAggregationByDevice();
    // analyzeAggregationByDomain();
    // this.fetchTimestampToDomain();
    //
    // // Set up update loops
    // const logLoop = setInterval(() => {
    //   this.fetchTimestampToDomain();
    // }, LOG_REFRESH_DELAY_MS);
    //
    // const liveConnectionsPerSecondLoop = setInterval(() => {
    //   this.fetchCombinedTrafficData();
    //   this.fetchAllDeviceGraphs();
    // }, DATA_REFRESH_DELAY_MS);
    //
    // const deviceHitsLoop = setInterval(() => {
    //   analyzeAggregationByDevice();
    //   analyzeAggregationByDomain();
    // }, DEVICE_HITS_REFRESH_DAY_MS);
    //
    // this.setState(() => ({
    //   logLoop,
    //   liveConnectionsPerSecondLoop,
    //   deviceHitsLoop,
    // }));
  }

  componentWillUnmount() {
    // const {
    //   logLoop,
    //   liveConnectionsPerSecondLoop,
    //   deviceHitsLoop,
    // } = this.state;
    // clearInterval(logLoop);
    // clearInterval(liveConnectionsPerSecondLoop);
    // clearInterval(deviceHitsLoop);
  }

  renderSingleDeviceCharts() {
    const { singleDeviceChartConfig, devices, devicesToHasData } = this.props;
    const { bucketConfig, selectionMode } = singleDeviceChartConfig;

    const listOfGraphs = devices
      .filter(d => {
        return devicesToHasData[d.macAddr];
      })
      .map(d => {
        const { macAddr } = d;
        const dataKey = getDataKey({ ...bucketConfig.toJS(), selectionMode });

        return (
          <FlexSize key={macAddr} size={{ xs: 12 }} space="m-bot-3">
            <BCard>
              <div className="extra-small-spacer" />
              <DeviceActivityChart
                className="device-chart"
                deviceKey={macAddr}
                dataKey={dataKey}
                device={d}
                chartConfig={singleDeviceChartConfig}
              />
            </BCard>
          </FlexSize>
        );
      });

    return listOfGraphs.length ? <Flex gutter={1}>{listOfGraphs}</Flex> : null;
  }

  renderMainChart() {
    const { combinedNetworkDevice, mainChartConfig } = this.props;
    const { bucketConfig, selectionMode } = mainChartConfig;

    return (
      <DeviceActivityChart
        className="main-chart"
        data={this.state.trafficVelocityData}
        device={combinedNetworkDevice}
        deviceKey={'COMBINED'}
        dataKey={getDataKey({
          ...bucketConfig.toJS(),
          selectionMode,
          macAddresses: [],
        })}
        chartConfig={mainChartConfig}
        placeholderSubtitle={'PACKETS/SEC'}
      />
    );
  }

  render() {
    // TODO integrate with redux
    const tempHeaders = [
      {label: 'Time', key: 'time', width: 133},
      {label: 'Device', key: 'device', width: 210},
      {label: 'Destination', key: 'dest', width: 270},
      {label: 'Bytes', key: 'size', width: 95}
    ];

    const tempList = [
      { key: '1', time: '1:56:02 am', device: 'google-home-mini', dest: 'google.com', size: '10'},
      { key: '2', time: '1:55:30 am', device: 'google-home-mini', dest: 'some-interesting-url.com', size: '10'}
    ];

    return (
      <div className="overview-tab">
        {/*<div className="tint-background2">*/}
          {/*<div />*/}
        {/*</div>*/}
        <RightContentWrapper>
          <GridLayout>
            <GridItem column={'col-start / span 5'} row={'1 / 4'}>
              <QuickFacts />
            </GridItem>
            <GridItem column={'col-start 6 / span 7'} row={'1 / 4'}>
              <Flex gutter={2}>
                <FlexSize size={{ lg: 12 }}>
                  <Title>Real-time Traffic</Title>
                  <BCard compact={false}>
                    {this.renderMainChart()}
                  </BCard>
                </FlexSize>
                <FlexSize size={{ lg: 5 }}>
                  {this.renderSingleDeviceCharts()}
                  {/*<DataTable headerData={tempHeaders}  rowData={tempList}/>*/}
                </FlexSize>
              </Flex>
            </GridItem>
          </GridLayout>
        </RightContentWrapper>
        <div className="xl-spacer" />
      </div>
    );
  }
}

OverviewTab.defaultProps = {
  networkId: 42,
};

OverviewTab.propTypes = {
  devices: PropTypes.array.isRequired,
  devicesToHasData: PropTypes.object.isRequired,
  deviceToNumConnection: PropTypes.object.isRequired,
  lastSeen: PropTypes.object.isRequired,
  combinedNetworkDevice: PropTypes.object.isRequired,
  mainChartConfig: PropTypes.object.isRequired,
  singleDeviceChartConfig: PropTypes.object.isRequired,
  mostRecentHosts: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  const singleDeviceChartConfig = selectSingleDeviceChartConfig(state);
  const { bucketConfig, selectionMode } = singleDeviceChartConfig;
  const deviceGraphKey = getDataKey({ ...bucketConfig.toJS(), selectionMode });

  return {
    devices: selectDeviceList(state),
    mostRecentHosts: selectMostRecentDomains(state, 15),
    devicesToHasData: hasDataForKey(state, deviceGraphKey),
    deviceToNumConnection: selectNumberOfConnections(state),
    lastSeen: selectLastSeen(state),
    combinedNetworkDevice: selectEntireNetwork(state),
    mainChartConfig: selectMainChartConfig(state),
    singleDeviceChartConfig: singleDeviceChartConfig,
  };
};
export default connect(mapStateToProps)(OverviewTab);
