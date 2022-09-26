
export interface LocationDto {
  name: string;
  uuid: string;
  parent_uuid: string;
  masterUnit: {
    id: number,
    name: string,
  }
}
