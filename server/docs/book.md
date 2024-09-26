# Book Usage API

### Read Book

```http
GET /book/read
```

Optional Query:

- `id`: book id
- `isbn`: book isbn

Response Body (no query):

```jsonc
[
  {
    "id": "1",
    "judul": "Gagal Menjadi Manusia",
    "pengarang": "Dazai Osamu",
    "penerbit": "CV. Haru",
    "tahun": "2020",
    "website": "http://www.penerbitharu.com/",
    "email": "penerbitharu@gmail.com",
    "image": "./gagalmenjadimanusia.jpg",
    "stock": 10,
    "tag": "gagal,menjadi,manusia,dazai,osamu",
    "type": "Literatur",
    "isbn": "9786237351306"
  },
  {...}
]
```

```http
GET /book/read?id=1
```

Response Body (id):

```jsonc
{
  "id": "1",
  "judul": "Gagal Menjadi Manusia",
  "pengarang": "Dazai Osamu",
  "penerbit": "CV. Haru",
  "tahun": "2020",
  "website": "http://www.penerbitharu.com/",
  "email": "penerbitharu@gmail.com",
  "image": "./gagalmenjadimanusia.jpg",
  "stock": 10,
  "tag": "gagal,menjadi,manusia,dazai,osamu",
  "type": "LITERATUR",
  "isbn": "9786237351306"
}
```

```http
GET /book/read?isbn=978-623-00-4556-1
```

Response Body (isbn):

```jsonc
{
  "judul": "Python untuk analisis dan visualisasi data",
  "isbn": "978-623-00-4556-1",
  "pengarang": "Jubilee Enterprise",
  "penerbit": "PT. Elex Media Komputindo",
  "tahun": "2023",
  "email": "dinda@elexmedia.id",
  "website": "www.elexmedia.id"
}
```

```http
GET /book/read?id=1&isbn=978-623-00-4556-1
```

Response Body (id & isbn):
`400 Bad Request:`

```jsonc
{ "message": "Pilih salah satu query yang ingin digunakan!" }
```

### Find Book

```http
GET /book/?tag=python
```

Response Body:

```jsonc
{
  "id": "2",
  "judul": "Python untuk analisis dan visualisasi data",
  "image": "./pythonuntukanalisisdanvisualisasidata.jpg",
  "stock": 4
}
```

## Admin Controller

### Create Book

Required headers:

- `authorization`: access token

Required role: `ADMIN`

```http
POST /book/create
```

Request Body:

```jsonc
{
  "judul": "Atomic habits : perubahan kecil yang memberikan hasil luar biasa", // required
  "pengarang": "James Clear", // required
  "penerbit": "PT. Gramedia Pustaka Utama", // optional
  "tahun": "2019", // optional
  "website": "http://www.gramediapustakautama.id/", // optional
  "email": "suprianto@gramediapustakautama.id", // optional
  "image": "./atomichabits.jpg", // optional
  "stock": 6, // default 0
  "tag": "atomic,habits", // optional
  "type": "FILOSOFI", // only accept ["LITERATUR" | "KOMPUTER" | "PSIKOLOGI" | "FILOSOFI" | "SENI" | "BAHASA" | "SEJARAH" | "MATEMATIKA" | "SAINS"]
  "isbn": "9786230045561" // optional
}
```

Response Body:

```jsonc
{
  "message": "Berhasil menambahkan buku",
  "data": {
    "id": "3",
    "judul": "Atomic habits : perubahan kecil yang memberikan hasil luar biasa",
    "pengarang": "James Clear",
    "penerbit": "PT. Gramedia Pustaka Utama",
    "tahun": "2019",
    "website": "http://www.gramediapustakautama.id/",
    "email": "suprianto@gramediapustakautama.id",
    "image": "./atomichabits.jpg",
    "stock": 6,
    "tag": "atomic,habits",
    "type": "FILOSOFI",
    "isbn": "9786230045561"
  }
}
```

### Delete Book

Required headers:

- `authorization`: access token

Required role: `ADMIN`

```http
PATCH /book/update
```

Request Body:

```jsonc
{
  "id": "3",
  "judul": "Atomic Habits : Perubahan Kecil Yang Memberikan Hasil Luar Biasa"
  // other fields
}
```

Response Body:

```jsonc
{
  "message": "Berhasil mengubah data buku",
  "book": {
    "id": "3",
    "judul": "Atomic Habits : Perubahan Kecil Yang Memberikan Hasil Luar Biasa",
    "pengarang": "James Clear",
    "penerbit": "PT. Gramedia Pustaka Utama",
    "tahun": "2019",
    "website": "http://www.gramediapustakautama.id/",
    "email": "suprianto@gramediapustakautama.id",
    "image": "./atomichabits.jpg",
    "stock": 6,
    "tag": "atomic,habits",
    "type": "FILOSOFI",
    "isbn": "9786230045561"
  }
}
```

### Delete Book

Required headers:

- `authorization`: access token

Required role: `ADMIN`

```http
DELETE /book/delete?id=3
```

Response Body:

```jsonc
{ "message": "Buku berhasil di hapus" }
```
