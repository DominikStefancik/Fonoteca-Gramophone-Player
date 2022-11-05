import { FileReference } from './references/file-reference';

export interface ObjSchemaElement {
  objSchemaFormatK: FileReference[];
  objSchemaExtensionK?: FileReference[];
  objSchemaProfileK?: FileReference[];
}
