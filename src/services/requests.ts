import { NativeModules } from 'react-native';
import { ClientProps } from '../types/global';

export const handleGetClientData = async (phoneNumber: string): Promise<null | ClientProps> => {
  try {
    const baseUrl: string = await NativeModules.NotificationModule.getApiBaseUrl();

    const response = await fetch(`${baseUrl}/clients/${phoneNumber}`);
    if (!response.ok) throw new Error(`HTTP error request: ${response.status}`);

    const data: ClientProps = await response.json();

    if (!data) throw new Error('Cliente no encontrado');

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
