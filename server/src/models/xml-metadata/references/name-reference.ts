export interface NameReference {
  value: string;
  attributes: {
    relTable?: 'Names';
    relKey?: number;
  };
}
