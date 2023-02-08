export interface AssetTransferDto {
  uuid: string;
  caretakerFrom: Caretaker,
  caretakerTo: Caretaker,
  assets: { id: number }[],
  createdAt: string;
  revertedAt: string | null;
  rejectedAt: string | null;
  acceptedAt: string | null;
  message: string | null
}


export interface AssetTransfer {
  uuid: string;
  caretakerFrom: Caretaker,
  caretakerTo: Caretaker,
  assets: { id: number }[],
  createdAt: Date;
  revertedAt: Date | null;
  rejectedAt: Date | null;
  acceptedAt: Date | null;
  message: string | null;
}

export interface Caretaker {
  id: number;
  name: string;
  surname: string;
  unit_id: number;
  unit_name: string;
}
