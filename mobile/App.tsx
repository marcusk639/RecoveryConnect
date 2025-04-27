import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import store from './src/store';
import {checkAuthState} from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  useEffect(() => {
    store.dispatch(checkAuthState());
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
