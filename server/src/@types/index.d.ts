interface User {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  newPassword?: string;
  oldPassword?: string;
  otp?: number;
}

interface Payload {
  id: string;
  username: string;
  name: string;
  email?: string | null;
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
  id: string?;
  image: string?;
  stock: number;
  tag?: string[];
  type: string;
  judul: string?;
  penerbit: string?;
  pengarang: string?;
  tahun: string?;
  isbn: string?;
  website: string?;
  email: string?;
}
