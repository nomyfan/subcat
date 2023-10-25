export interface Item {
  id: string;
  url: string;
  src: string;
  middle: number;
  bottom: number;
  width: number;
  height: number;
}

export interface StoreState {
  items: Item[];
  draggingId?: string;
  selected?: number;
}

export type Index = number;
