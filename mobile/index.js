/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.log('AppRegistry', AppRegistry);
AppRegistry.registerComponent(appName, () => App);
