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
import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Aviso interno de react-native-draggable-flatlist@4.0.3 (la última versión
// disponible): pasa un array de dependencias a useDerivedValue/
// useAnimatedReaction, una API que Reanimated 4 solo usa en su implementación
// web y por eso marca con este warning en nativo. Es inofensivo (__DEV__-only,
// el array se ignora) y aparece decenas de veces por pantalla — ver issue #20.
// Además del ruido, tapa el resto de la UI con el toast de LogBox (spec 9.2
// paso 6), así que conviene silenciarlo puntualmente en vez de dejarlo.
LogBox.ignoreLogs(['dependencies should only be used in web implementation']);

AppRegistry.registerComponent(appName, () => App);
