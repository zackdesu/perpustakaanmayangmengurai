# Account Usage API

Note:

- Save your token into Local Storage or Session Storage.

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
    "email": "zackdesu@email.com" // not exist if email is not inputted
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
    "email": "zackdesu@email.com", // not exist if email is not inputted
    "role": "MEMBER"
  },
  "accessToken": "jwt_access_token"
}
```

### Refresh Token

Required Cookies:

- `refreshToken`: gain after logged in

```http
GET /auth/refresh
```

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
    "email": "zackdesu@email.com", // not exist if email is not inputted
    "role": "MEMBER"
  }
}
```

### Update User Details

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
  "email": "zackdesuuuuu@email.com", // optional
  "oldPassword": "123456", // required for password changes
  "newPassword": "654321", // required for password changes
  "otp": "xxxx" // required if email is inputted / changed
}
```
