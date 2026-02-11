import { NativeModules } from 'react-native';
import { ClientProps, LogoutClientProps } from '../types/global';

export const handleInitializeClient = async (phoneNumber: string): Promise<null | ClientProps> => {
  try {
    const baseUrl: string = await NativeModules.NotificationModule.getApiBaseUrl();

    const response = await fetch(`${baseUrl}/clients/${phoneNumber}`);
    if (!response.ok) throw new Error(`HTTP error request: ${response.status}`);

    const data: ClientProps = await response.json();

    if (!data) throw new Error('Cliente no encontrado');

    return data;
  } catch (error) {
    return null;
  }
};

export const handleValidateClient = async (phoneNumber: string): Promise<null | ClientProps> => {
  try {
    const baseUrl: string = await NativeModules.NotificationModule.getApiBaseUrl();

    const response = await fetch(`${baseUrl}/clients/validate/${phoneNumber}`);
    if (!response.ok) throw new Error(`HTTP error request: ${response.status}`);

    const data: ClientProps = await response.json();

    if (!data) throw new Error('Cliente no encontrado');

    return data;
  } catch (error) {
    return null;
  }
};

export const handleLeaveClient = async (body: LogoutClientProps): Promise<boolean> => {
  try {
    const baseUrl: string = await NativeModules.NotificationModule.getApiBaseUrl();

    const response = await fetch(`${baseUrl}/clients/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error request: ${response.status}`);

    const data = await response.json();

    return data.success;
  } catch (error) {
    return false;
  }
};
