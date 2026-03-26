import { NativeModules, Platform } from 'react-native';

const { WidgetModule } = NativeModules;

export const updateWidget = () => {
  if (Platform.OS === 'android' && WidgetModule) {
    WidgetModule.updateWidget();
  }
};