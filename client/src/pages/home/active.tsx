import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

type ActiveStudents = {
  nama: string;
  kehadiran: number;
};

const Active = () => {
  const [activeStudents, setActiveStudents] = useState<
    ActiveStudents[] | never
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveStudents([
        { nama: "Wongso Wijaya", kehadiran: 10 },
        { nama: "Wengse Wijaya", kehadiran: 19 },
        { nama: "Wungsu Wijaya", kehadiran: 15 },
        { nama: "Wangsa Wijaya", kehadiran: 17 },
        { nama: "Wingsi Wijaya", kehadiran: 12 },
      ]);
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  });
  return (
    <section>
      <h3 className="mt-10">Siswa paling aktif</h3>
      <p className="text-zinc-500">
        Paling sering mengunjungi perpustakaan (top 5)
      </p>
      <Table>
        <TableCaption>Siswa paling aktif</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Nama Siswa</TableHead>
            <TableHead>Jumlah Kehadiran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="w-12 h-53 p-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-53 p-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-12 h-53 p-4" />
                  </TableCell>
                </TableRow>
              ))
            : activeStudents
                .sort((e, i) => i.kehadiran - e.kehadiran)
                .map((e, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{e.nama}</TableCell>
                    <TableCell>{e.kehadiran}</TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>
    </section>
  );
};

// <Skeleton className="h-53 p-4" />

export default Active;
