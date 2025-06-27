import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { useAppState } from './hooks/useAppState';
import { Theme } from './types';

const GlobalStyle = createGlobalStyle<{ $theme: Theme }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.$theme.colors.background};
    color: ${props => props.$theme.colors.text};
    overflow: hidden;
  }

  #root {
    height: 100vh;
    width: 100vw;
  }
`;

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
`;

function App() {
  const {
    state,
    addTracks,
    setHoveredTrack,
    setFocusedTrack,
    setTheme,
    removeTrack,
    toggleTrackVisibility,
  } = useAppState();

  return (
    <ThemeProvider theme={state.theme}>
      <GlobalStyle $theme={state.theme} />
      <AppContainer>
        <Sidebar
          tracks={state.tracks}
          hoveredTrack={state.hoveredTrack}
          focusedTrack={state.focusedTrack}
          theme={state.theme}
          onTracksAdd={addTracks}
          onTrackHover={setHoveredTrack}
          onTrackFocus={setFocusedTrack}
          onTrackRemove={removeTrack}
          onTrackVisibilityToggle={toggleTrackVisibility}
          onThemeChange={setTheme}
        />
        <Map
          tracks={state.tracks}
          hoveredTrack={state.hoveredTrack}
          focusedTrack={state.focusedTrack}
          theme={state.theme}
          onTrackHover={setHoveredTrack}
          onTrackFocus={setFocusedTrack}
        />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;