const Informasi = () => {
  return (
    <section>
      <h2 className="font-semibold">Informasi Perpustakaan</h2>
      <hr className="mx-3 mt-8 mb-4" />
      <div className="md:grid grid-cols-2">
        <div className="md:mr-5">
          <h3 className="mb-1 md:mb-3 font-semibold">Informasi Kontak</h3>
          <p className="font-medium">Alamat:</p>
          <p>
            Jl. Cut Nyak Dien, Purnama, Dumai Barat, Kota Dumai, Provinsi Riau,
            28823
          </p>
          <p className="font-medium">Nomor Telepon:</p>
          <p>(0765) 34328</p>
          <p className="font-medium">Nomor Fax:</p>
          <p>(0765) 34328</p>
        </div>
        <div className="max-md:mt-5 md:ml-5">
          <h3 className="mb-1 md:mb-3 font-semibold">Jam Kerja</h3>
          <p className="font-medium">Senin - Kamis:</p>
          <p>08:00 s.d. 16:00 WIB</p>
          <p className="font-medium">Jum'at:</p>
          <p>08:00 s.d. 11:00 WIB</p>
        </div>
      </div>
    </section>
  );
};

export default Informasi;
