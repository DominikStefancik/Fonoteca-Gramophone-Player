import { FieldReference } from './references/field-reference';

export interface ObjDetailElement {
  headSection: string;
  objDetailFieldK: FieldReference[];
  objDetailValueR?: ObjDetailValueRElement[];
  objDetailGrp?: string[];
}

interface ObjDetailValueRElement {
  value: string;
  dataType: string;
  relTable?: string;
  relKey?: string;
  lngKey?: number;
  lngOcc?: number;
}
