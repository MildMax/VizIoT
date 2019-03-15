'use es6';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getBucketKeyWithConfig } from '../utility/BucketUtility';
import { selectSingleAggregation } from '../selectors/aggregateSampleSelector';
import moment from 'moment';
import LineChart from '../components/LineChart';

class ConnectedLineChart extends React.Component {
  render() {
    const {
      device,
      chartConfig: {
        dataWindowSize,
        bucketConfig: { bucketProps },
      },
      data,
      placeholderSubtitle,
    } = this.props;

    const { socketAddr = '', macAddr = '', port = '', ip = '', alias } = device;
    // console.log(`Rendering chart for ${socketAddr} AKA ${macAddr} AKA ${alias}`);
    // console.log('using data:');
    // console.log(data);

    macAddr && macAddr.toUpperCase();

    let graphData = [];
    if (data && data.length) {
      const catchUpSeconds = 2;
      graphData = data.map(({ startMS, size: yData }) => {
        return {
          xData: moment
            .unix(startMS / 1000.0)
            .add(catchUpSeconds, 'seconds')
            .toDate(),
          yData,
        };
      });
    }

    let subtitle = <span>{placeholderSubtitle}</span>;
    if (ip && port) {
      subtitle = (
        <span>
          <strong>{ip}</strong>
          {`:${port}`}
        </span>
      );
    } else if (macAddr) {
      subtitle = (
        <span>
          <strong>{macAddr}</strong>
        </span>
      );
    }

    if (graphData.length >= 1) {
      return (
        <LineChart
          className={this.props.className}
          dataWindowSize={dataWindowSize}
          subtitle={subtitle}
          title={alias || macAddr}
          data={graphData}
        />
      );
    } else {
      return null;
    }
  }
}

ConnectedLineChart.defaultProps = {
  data: [],
};

ConnectedLineChart.propTypes = {
  data: PropTypes.array,
  dataSelector: PropTypes.func.isRequired,
};

export default connect((state, props) => {
  return {
    data: props.dataSelector(state)
  };
})(ConnectedLineChart);