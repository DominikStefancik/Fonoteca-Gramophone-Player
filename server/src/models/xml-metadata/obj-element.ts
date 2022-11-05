import { ObjDetailElement } from './objDetail-element';
import { ObjItemElement } from './objItem-element';
import { ObjSchemaElement } from './objSchema-element';

export interface ObjElement {
  attributes: { uniqueKey: string; lang: string };
  objSchema: ObjSchemaElement[];
  objDetail: ObjDetailElement[];
  objCallNbr?: string[];
  objItem?: ObjItemElement[];
  objThumbnailK: string[];
  objRemarks?: string[];
}
