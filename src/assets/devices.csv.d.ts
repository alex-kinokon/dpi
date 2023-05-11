export interface Device {
  name: string;
  width: number;
  height: number;
  diagonal: number;
  dppx: number;
  year: object;
  type: string;
  ppi: object;
}
declare const devices: Device[];
export default devices;
