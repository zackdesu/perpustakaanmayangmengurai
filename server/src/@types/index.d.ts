type Jurusan = "AKL" | "PN" | "MPLB" | "TKJ" | "BSN" | "KUL" | "ULP";

interface ReqAcc {
  id?: string;
  name?: string;
  username?: string;
  password?: string;
  email?: string | null;
  newPassword?: string;
  oldPassword?: string;
  otp?: string;
  absentnum?: string;
  angkatan?: string;
  jurusan?: Jurusan;
  kelas?: string;
  NISN?: string | null;
  NIPD?: string | null;
  Tempat?: string | null;
  TanggalLahir?: Date | null;
  accId?: string | null;
}

interface Acc {
  id?: string;
  name?: string;
  username?: string;
  password?: string;
  email?: string | null;
  newPassword?: string;
  oldPassword?: string;
  otp?: number;
  absentnum?: number;
  angkatan?: number;
  jurusan?: Jurusan;
  kelas?: number;
  NISN?: string | null;
  NIPD?: string | null;
  Tempat?: string | null;
  TanggalLahir?: Date | null;
  accId?: string | null;
}

interface Payload {
  id: string;
  username: string;
  name: string;
  email?: string | null;
  role: "ADMIN" | "MEMBER";
}

interface GetISBN {
  judul?: string;
  isbn?: string | null;
  pengarang?: string;
  penerbit?: string | null;
  tahun?: string | null;
  email?: string | null;
  website?: string | null;
}
