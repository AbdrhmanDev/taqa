import { Iarea } from '../../area/models/iarea';

export interface Izone {
  zoneId: number;
  name: string;
  areas?: Iarea[];
}
