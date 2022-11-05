export interface FileReference {
  value: string;
  attributes: {
    relTable?: 'Files';
    relKey?: number;
  };
}
