const generateUserId = (jurusan: Jurusan, kelas: number, absentnum: number) => {
  const codeJurusan = {
    AKL: "2",
    PN: "3",
    MPLB: "4",
    TKJ: "5",
    BSN: "6",
    KUL: "7",
    ULP: "8",
  };

  return (
    new Date().getFullYear() +
    codeJurusan[jurusan] +
    kelas +
    absentnum.toString().padStart(3, "0")
  );
};

export default generateUserId;
