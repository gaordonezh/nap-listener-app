import { ClientProps } from '../types/global';

export const handleGetClientData = async (phoneNumber: string): Promise<ClientProps> => {
  const params = new URLSearchParams({ phone: phoneNumber });
  const response = await fetch(`http://192.168.1.202:5001/clients?${params.toString()}`);
  if (!response.ok) throw new Error(`HTTP error request: ${response.status}`);

  const data: Array<ClientProps> = await response.json();

  if (!data.length) throw new Error('Cliente no encontrado');

  return data[0];
};
