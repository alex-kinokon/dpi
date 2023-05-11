export interface Device {
  manufacturer: string;
  name: string;
  type: string;
  width: number;
  height: number;
  diagonal: number;
  dppx: number;
  year: number;
  ppi: number;
  deviceType: string;
}
declare const devices: Device[];
export default devices;
