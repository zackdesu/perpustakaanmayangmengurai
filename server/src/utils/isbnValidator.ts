function isValidISBN10(isbn: string): boolean {
  // Hapus karakter non-digit kecuali 'X'
  isbn = isbn.replace(/[^0-9X]/gi, "");

  // ISBN-10 harus memiliki panjang 10
  if (isbn.length !== 10) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(isbn[i], 10);
    if (isNaN(digit)) return false;
    sum += (10 - i) * digit;
  }

  const checkDigit = isbn[9].toUpperCase();
  sum += checkDigit === "X" ? 10 : parseInt(checkDigit, 10);

  return sum % 11 === 0;
}

function isValidISBN13(isbn: string): boolean {
  // Hapus karakter non-digit
  isbn = isbn.replace(/[^0-9]/g, "");

  // ISBN-13 harus memiliki panjang 13
  if (isbn.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn[i], 10);
    if (isNaN(digit)) return false;
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  return sum % 10 === 0;
}

function isISBN(isbn: string): boolean {
  // Cek format ISBN-10
  if (isbn.length === 10 && isValidISBN10(isbn)) return true;

  // Cek format ISBN-13
  if (isbn.length === 13 && isValidISBN13(isbn)) return true;

  return false;
}

export default isISBN;
