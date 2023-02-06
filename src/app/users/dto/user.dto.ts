
export interface UserDto {
  id: number;
  username: string;
  name: string;
  surname: string;
  unit_id: number;
  reachable: boolean;
}

export interface CaretakerDto {
  id: number;
  name: string;
  surname: string;
  unit_id: number;
  unit_name: string;
}
