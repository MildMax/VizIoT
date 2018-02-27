import React from 'react';
import Grid from '../components/BeanUILibrary/Grid';
import GridItem from '../components/BeanUILibrary/GridItem';
import { connect } from 'react-redux';
import BubbleChart from '../components/d3/BubbleChart';
import { SPACING } from '../data/records/Spacing';
import AutoFitComponent from '../components/AutoFitComponent';
import BucketUnitConstants from '../constants/BucketUnit';

const DATA_REFRESH_DELAY_MS = 5 * 1000;

class BubbleLocationTab extends React.Component {
  componentWillMount() {
    const dataFetchLoop = setInterval(() => {
      //   TODO Fetch Locational Data
      // const { devices } = this.props;
      // devices.forEach(({ macAddr }) => {
      // });
    }, DATA_REFRESH_DELAY_MS);

    this.setState(() => ({
      dataFetchLoop: dataFetchLoop,
    }));
  }

  componentWillUnmount() {
    clearInterval(this.state.dataFetchLoop);
  }

  render() {
    const data = [
      { id: 'main.network1.device1.apple', value: 1 },
      { id: 'main.network1.device1.google', value: 4 },
      { id: 'main.network2.device2.google', value: 3 },
      { id: 'main.network1.device3.xiaomi', value: 1 },
      { id: 'main.network1.device3.xiaomi', value: 1 },
      { id: 'main.network2.device3.xiaomi', value: 1 },
      { id: 'main.network2.device3.xiaomi', value: 20 },
      { id: 'main.network1.device3.xiaomi', value: 1 },
    ];

    return (
      <Grid gutter={3}>
        <GridItem size={{ md: 12 }}>
          <h5 className="wide-letter deviceList__title">
            REQUESTS BY LOCATION
          </h5>
          <AutoFitComponent className="location-bubble-chart">
            <BubbleChart
              dimension={{
                width: 0,
                height: 0,
              }}
              data={data}
              dataWindowSize={0}
              dataWindowUnit={BucketUnitConstants.LOCATION}
              padding={new SPACING({ l: 20, r: 20, t: 20, b: 20 })}
            />
          </AutoFitComponent>
        </GridItem>
      </Grid>
    );
  }
}

BubbleLocationTab.defaultProps = {};

const mapStateToProps = state => {
  return {};
};
export default connect(mapStateToProps)(BubbleLocationTab);