import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  username: z
    .string()
    .min(5, { message: "Username lebih dari 4 kata!" })
    .max(25, { message: "Username tidak lebih dari 25 kata!" }),
  password: z.string(),
});

const Areaanggota = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (val: z.infer<typeof formSchema>) => {
    setLoading(true);
    setTimeout(() => {
      console.log(val);
      setLoading(false);
    }, 5000);
  };

  return (
    <>
      <h2 className="font-semibold">Area Anggota</h2>
      <hr className="mx-3 mt-8 mb-4" />
      <p className="mt-4 mb-4">
        Masukan ID anggota serta kata sandi yang diberikan oleh administrator
        sistem perpustakaan. <br /> Jika Anda anggota perpustakaan namun belum
        memiliki kata sandi, hubungi staf perpustakaan.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Anggota</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Masukkan ID"
                    {...field}
                    autoComplete="off"
                    disabled={loading}
                    className="w-64 md:w-96"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata Sandi</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Masukkan Password"
                    {...field}
                    autoComplete="off"
                    disabled={loading}
                    className="w-64 md:w-96"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-[85px]"
            disabled={loading}
            aria-label="Submit"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default Areaanggota;
