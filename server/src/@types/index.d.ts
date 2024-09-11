interface Acc {
  id?: string;
  name?: string;
  username?: string;
  password?: string;
  email?: string | null;
  newPassword?: string;
  oldPassword?: string;
  otp?: number;
  absentnum?: string;
  angkatan?: string;
  jurusan?: "AKL" | "PN" | "MPLB" | "TKJ" | "BSN" | "KUL" | "ULP";
  kelas?: string;
}

interface Payload {
  id: string;
  username: string;
  name: string;
  email?: string | null;
  role: "ADMIN" | "MEMBER";
}

interface GetISBN {
  Judul: string?;
  Penerbit: string?;
  Pengarang: string?;
  Tahun: string?;
  ISBN: string?;
  Website: string?;
  Email: string?;
}

interface Book {
  id?: string;
  judul?: string;
  pengarang?: string;
  penerbit?: string | null;
  tahun?: string | null;
  website?: string | null;
  email?: string | null;
  image?: string | null;
  stock?: number;
  tag?: string | null;
  type?: $Enums.BookType;
  isbn?: string | null;
}
