'use es6';

import styled from 'styled-components';
import React from 'react';
import AppMenuBar from 'VizIoT/components/AppMenuBar';
import TabItem from 'UIBean/TabItem';
import TabRow from 'UIBean/TabRow';
import { tabKeys, Tabs } from 'VizIoT/constants/TabNavigation';

const Container = styled.div`
  position: relative;
  width: 100vw;
  z-index: 3;
`;

const NavItemsContainer = styled.div`
  height: 140px;
  z-index: 8;
`;

const getTabByPath = path => {
  const key = Object.keys(tabKeys).filter(k => Tabs[k].path === path);
  return Tabs[key];
};

export default ({ location }) => {
  const { key } = getTabByPath(location.pathname) || {};

  return (
    <Container>
      <AppMenuBar />
      <NavItemsContainer>
        <TabRow>
          {Object.keys(tabKeys).map(k => {
            const { title, path } = Tabs[k];
            return (
              <TabItem key={k} active={key === k} to={path}>
                {title}
              </TabItem>
            );
          })}
        </TabRow>
      </NavItemsContainer>
    </Container>
  );
};
