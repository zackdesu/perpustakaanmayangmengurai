import app from "./app";

const PORT = process.env.PORT || 3000;
console.log(PORT);
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
