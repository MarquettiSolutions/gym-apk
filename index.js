/**
 * @format
 */

// Debe ser el primer import del entry point (requisito de la librería, para
// que instale su manejador de eventos táctiles antes que cualquier otra cosa).
import 'react-native-gesture-handler';
// Debe importarse antes que cualquier módulo que use `uuid` (ej. el esquema
// de la base de datos), ya que provee el polyfill de crypto.getRandomValues
// que `uuid` necesita en React Native.
import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
