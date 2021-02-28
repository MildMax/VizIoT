import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Flex from '../components/BeanUILibrary/Flex';
import DataWell from '../components/BeanUILibrary/DataWell';
import DataWellValue from '../components/BeanUILibrary/DataWellValue';
import styled from 'styled-components';
import BIcon from '../components/BeanUILibrary/BIcon';
import { H2 } from '../components/BeanUILibrary/functional-css/TypographyStyles';
import {useSocket} from '../components/BeanUILibrary/hooks/useSocket';

// to get rid of color, remove color attribute (USED FOR LEGEND PURPOSES)
const DataWellValueWithFontSize = styled(DataWellValue)`
  font-size: ${props => props.fontSize};
  color: ${props => props.color};
  background-color: ${props => props.backgroundColor};
`;

const Proto = styled.div`
  ${H2}
  padding-bottom: 2rem;
  font-weight: 200;
  color: #fff;
`;

const StyledDataWell = styled(DataWell)`
  padding-bottom: 2rem;
`;

const StyledMetric = styled.div`
  width: 250px;
`

const MetricContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`

const WellTitle = styled.div`
  font-size: 2.1rem;
  margin-bottom: 5px;
`

const ConnectedDataValue = connect((state, { dataSelector }) => {
    return {
        children: dataSelector(state) || '~',
    };
})(DataWellValueWithFontSize);

/**
 *  Finds the size of the most recent data packets from the current stream.
 *  Stream 0: In
 *  Stream 1: Out
 *
 * @param data the data stream to pull info from
 * @param index the index of data to transform
 * @returns {number}
 */
function transformData(data, index) {
    if (data && data.length) {
        let lag = Math.min(2, parseInt(data.length))
        return data[data.length - lag].size[index];
    }
    return 0;
}

/**
 * Formats Bytes per Second for each stream.
 *
 * @param data numeric data to be formatted.
 * @returns {string}
 */
const formatBytesPerSecond = data => {
    return data + ' B/s';
}

const renderMetrics = (displayFacts, displayStreams, streamData, lineColors) => {

    // determine how to display the fact
    // if stream is displayed, create line corresponding to color of line on graph
    // else, display a cube
    let facts = [];
    for (let i = 0; i < displayFacts.length; ++i) {
        if (displayStreams.includes(i)) {
            facts.push({
                title: displayFacts[i],
                dataSelector: () => formatBytesPerSecond(transformData(streamData, i)),
                iconType: 'eva',
                color: lineColors[i],
                fontSize: '4.0rem'
            })
        } else {
            facts.push({
                title: displayFacts[i],
                dataSelector: () => formatBytesPerSecond(transformData(streamData, i)),
                iconType: 'eva',
                icon: 'cube',
                color: lineColors[i],
                fontSize: '4.0rem'
            })
        }
    }

    return (
        <Flex>
            {facts.map(({ title, dataSelector, fontSize, icon, iconType, color }) => {
                return (
                    <StyledMetric key={title}>
                        <StyledDataWell>
                            {getDataWellHead(icon, iconType, color)}
                            <WellTitle fontSize={'2.5rem'}>{title}</WellTitle>
                            <ConnectedDataValue fontSize={fontSize || '5.0rem'} color={color || 'white'} dataSelector={dataSelector} />
                        </StyledDataWell>
                    </StyledMetric>
                );
            })}
        </Flex>
    )

}

/**
 * Return an icon if specified, other create colored line.
 *
 * @param icon icon to be displayed (optional)
 * @param iconType icon-type per eva library
 * @param color color of icon or line
 * @returns {JSX.Element}
 */
const getDataWellHead = (icon, iconType, color) => {
    if (icon) {
        return (
            <div>
                {icon && <BIcon name={icon} type={iconType} size={28} color={color} />}
            </div>
        )
    } else {
        return (
            <div
                style={{
                    marginBottom: '5px'
                }}
            >
                <hr
                    style={{
                        color: color,
                        backgroundColor: color,
                        height: '5px',
                        width: '120px',
                        marginLeft: '2px'
                    }}
                />
            </div>
        )
    }
}

const FlexedFacts = ({
    apiSource,
    packetPusher,
    legendTitle,
    displayFacts,
    displayStreams,
    lineColors,
    streamData
}) => {

    useSocket(apiSource, packetPusher)

    return (
        <Flex>
            <Proto>{legendTitle}</Proto>
            <MetricContainer id={'metric-container'}>
                {renderMetrics(displayFacts, displayStreams, streamData, lineColors)}
            </MetricContainer>
        </Flex>
    );
}


FlexedFacts.propTypes = {
    apiSource: PropTypes.string.isRequired,
    packetPusher: PropTypes.func.isRequired,
    packetSelector: PropTypes.func.isRequired,
    legendTitle: PropTypes.string,
    lineColors: PropTypes.array,
    displayFacts: PropTypes.array.isRequired,
    displayStreams: PropTypes.array,
    streamData: PropTypes.array,
}

const mapStateToProps = (state, props) => {
    let data = props.packetSelector(state);
    if(!data) { data = []; }
    return {
        streamData: data,
    };
};

export default connect(mapStateToProps)(FlexedFacts);

