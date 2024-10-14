# Borrowing Book Usage API

Note: required cookie `accessToken` and role `ADMIN`

### Borrower Lists

Optional Query:

- `name`: to find user name

```http
GET /book/list
```

Response Body (no query):

```jsonc
[
  {
    "id": 1,
    "waktuPeminjaman": "2024-09-26T05:30:38.746Z",
    "batasPengembalian": "2024-09-29T16:59:59.999Z",
    "waktuKembali": null,
    "status": "DIPINJAM",
    "denda": 0,
    "bookCode": "234567",
    "accId": "202272036",
    "bookId": "1",
    "acc": {
      "name": "Wongso Wijaya",
      "user": {
        "angkatan": 12,
        "jurusan": "KUL",
        "kelas": 2
      }
    },
    "book": {
      "judul": "Gagal Menjadi Manusia",
      "image": "./gagalmenjadimanusia.jpg"
    }
  },
  {
    "id": 2,
    "waktuPeminjaman": "2024-09-24T03:15:33.746Z",
    "batasPengembalian": "2024-09-27T16:59:59.999Z",
    "waktuKembali": null,
    "status": "DIPINJAM",
    "denda": 0,
    "bookCode": "121212",
    "accId": "202322005",
    "bookId": "3",
    "acc": {
      "name": "Bunga Aprilia Sitompul",
      "user": {
        "angkatan": 11,
        "jurusan": "AKL",
        "kelas": 2
      }
    },
    "book": {
      "judul": "Atomic habits : perubahan kecil yang memberikan hasil luar biasa",
      "image": "./atomichabits.jpg"
    }
  },
  {...}
]
```

```http
GET /book/list?name=Wongso%20Wijaya
```

Response Body (w/ query):

```jsonc
[
  {
    "id": 1,
    "waktuPeminjaman": "2024-09-26T05:30:38.746Z",
    "batasPengembalian": "2024-09-29T16:59:59.999Z",
    "waktuKembali": null,
    "status": "DIPINJAM",
    "denda": 0,
    "bookCode": "234567",
    "accId": "202272036",
    "bookId": "1",
    "acc": {
      "name": "Wongso Wijaya",
      "user": {
        "angkatan": 12,
        "jurusan": "KUL",
        "kelas": 2
      }
    },
    "book": {
      "judul": "Gagal Menjadi Manusia",
      "image": "./gagalmenjadimanusia.jpg"
    }
  },
  {...}
]
```

### Borrowing Book

```http
GET /book/borrow
```

Request Body:

```jsonc
{
  "lamaHari": "3",
  "bookId": "1",
  "accId": "202272036",
  "bookCode": "234567"
}
```

Response Body:

```jsonc
{
  "message": "Berhasil meminjamkan buku! Buku sudah bisa diberikan kepada peminjam."
}
```

### Returning Book

```http
GET /book/return
```

Request Body:

```jsonc
{
  "bookId": "1",
  "bookCode": "234567"
}
```

Response Body:

```jsonc
{ "message": "Berhasil mengembalikan buku!" }
```

Response Body (if late):

```jsonc
{ "message": "Terlambat selama 2 hari dan dikenakan denda 2000!" }
```

### Report Lost Book

```http
GET /book/lost
```

Request Body:

```jsonc
{
  "bookId": "1",
  "bookCode": "234567"
}
```

Response Body:

```jsonc
{
  "message": "Berhasil melaporkan buku yang hilang!"
}
```

### Fine

```http
GET /book/fine
```

Request Body:

```jsonc
{
  "id": "1",
  "bookCode": "234567",
  "type": "DENDA" // only accept "DENDA" or "BUKU"
}
```

Response Body:

```jsonc
{ "message": "Berhasil membayar denda!" }
```
