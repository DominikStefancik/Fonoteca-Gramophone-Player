import { NameReference } from './references/name-reference';

export interface ObjItemElement {
  objItemNbr: string[];
  objItemCondition?: string[];
  objItemLocation?: ObjItemLocation[];
  objItemOrigin?: ObjItemOrigin[];
  objItemCollectionK?: NameReference[];
  objItemReceived?: ObjItemReceived[];
  objItemCopies?: string[];
}

interface ObjItemLocation {
  objItemLocationK: string;
  objItemSubLocation?: string;
}

interface ObjItemOrigin {
  objItemOriginK: string;
  objItemSubOrigin?: string;
}

interface ObjItemReceived {
  objItemReceivedDate?: string;
  objItemReceivedOwnershipK: string;
}
