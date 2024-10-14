import prisma from "./db";

// prisma.acc
//   .update({ where: { username: "admin" }, data: { role: "ADMIN" } })
//   .then(console.log);
// prisma.loan.findMany().then((res) => {
//   console.log(res);
// });

// prisma.book.findMany().then(console.log);
// prisma.acc.delete({ where: { username: "zackdesuu" } }).then(console.log);
// prisma.loan.deleteMany().then(console.log);
// prisma.book
//   .update({
//     where: { id: "9ab0cd6d-f916-4d6b-83d0-8584a80f30d2" },
//     data: { stock: 1 },
//   })
//   .then(console.log);

// prisma.book
//   .findFirst({ where: { id: "9ab0cd6d-f916-4d6b-83d0-8584a80f30d2" } })
//   .then(console.log);

prisma.book.findMany().then(console.log);
