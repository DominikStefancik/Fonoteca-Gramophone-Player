export interface FieldReference {
  value: string;
  attributes: {
    dcTags: string;
    isPublic?: boolean;
    mp3Ready?: boolean;
    relTable?: 'Fields';
    relKey?: number;
  };
}
