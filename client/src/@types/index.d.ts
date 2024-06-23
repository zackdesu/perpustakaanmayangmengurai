interface BookDatas {
  id: number;
  image: string;
  name: string;
  author: string;
  stock: number;
  tag: string[];
  desc?: string;
  genre?: string;
  year?: number;
  type:
    | "Literatur"
    | "Komputer & Program"
    | "Psikologi & Filosofi"
    | "Bahasa"
    | "Sejarah"
    | "Matematika & Sains";
}
