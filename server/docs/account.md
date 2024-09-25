# Account Usage API

`PORT`: default port is 3000 on localhost

#### Register

```http
POST /auth/register
```

Request Body:

```json
{
  "username": "zackdesu", // min. 3 character length
  "password": "123456", // min. 6 character length
  "name": "Wongso Wijaya", // min. 2 character length
  "email": "zackdesu@email.com", // optional
  "otp": "xxxx", // only required when email is inputted
  "absentnum": "36", // range 1-40
  "angkatan": "12", // range 10-12
  "jurusan": "KUL", // only accept ["AKL", "PN", "MPLB", "TKJ", "BSN", "KUL", "ULP"]
  "kelas": "2" // max. 3
}
```

Response Type:

```json
{
  "message": "Akun berhasil dibuat!",
  "user": {
    "id": 202272036,
    "username": "zackdesu",
    "email": "zackdesu@email.com" // not exist if email not inputted
  }
}
```

### OTP code

```http
POST /auth/otp
```

Request Body:

```json
{ "email": "zackdesu@email.com" }
```

Response Body:

```json
{ "message": "OTP code sent successfully!" }
```

### Log in

```http
POST /auth/login
```

Request Body:

```json
{
  "username": "zackdesu",
  "password": "123456"
}
```

Response Body:

```json
{
  "message": "Selamat datang, zackdesu!",
  "user": {
    "id": "202272036",
    "username": "zackdesu",
    "name": "Wongso Wijaya",
    "email": "zackdesu@email.com",
    "role": "MEMBER"
  },
  "accessToken": "jwt_access_token"
}
```

### Refresh Token

```http
GET /auth/refresh
```

Required Cookies:

- `refreshToken`: gain after logged in

Response Body:

```json
{ "accessToken": "jwt_access_token" }
```

### Log out

```http
DELETE /auth/logout
```

Response Body:

```json
{ "message": "Berhasil logout!" }
```

### User Detail

Required headers:

- `Authorization`: access token

```http
GET /auth/details
```

Response Body:

```json
{
  "user": {
    "id": "202272036",
    "username": "zackdesu",
    "name": "Wongso Wijaya",
    "email": "zackdesu@email.com",
    "role": "MEMBER"
  }
}
```

### Update User Detail

Required headers:

- `Authorization`: access token

```http
PATCH /auth/update
```

Request Body (optional):

```json
{
  "username": "zackdesuuuuu",
  "name": "Wongso Wijoyo",
  "email": "zackdesuuuuu@email.com",
  "oldPassword": "123456",
  "newPassword": "654321",
  "otp": "xxxx" // required if email is inputted / changed
}
```

| Status Code | Description                                       | Context/Example                                                                              |
| :---------- | :------------------------------------------------ | :------------------------------------------------------------------------------------------- |
| `400`       | Bad Request: Input data not valid or not complete | "Username atau password belum di isi!" atau "Masukkan kode OTP yang valid dari email!"       |
| `401`       | Unauthorized: Wrong password or token             | "Password salah!"                                                                            |
| `403`       | Forbidden: Forbidden Access, Token is Exist       | "User have logged in." atau "Refresh Token Invalid!"                                         |
| `404`       | Not Found                                         | "Pengguna tidak ditemukan!" atau "Kamu belum mengirim OTP ke emailmu!"                       |
| `409`       | Conflict: Data is exist                           | "Username sudah digunakan, ganti username anda dengan yang lain."                            |
| `429`       | Too Many Requests                                 | "Kamu sudah mengirimkan OTP sebelumnya!"                                                     |
| `500`       | Internal Server Error                             | "Refresh Token Secret not found!", "Panjang ID bukan 9!" atau "User not found in find user!" |
