export interface Item {
  id: string;
  url: string;
  src: string;
  middle: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Store {
  items: Item[];
  selected?: number;
}
