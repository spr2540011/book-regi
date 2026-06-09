const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Render かどうか判定
const isRender = !!process.env.PORT;

// ローカル用のファイルパス
const filePath = "./books.json";

// メモリ保存（Render 用）
let memoryBooks = [];

// データ取得
function getBooks() {
  if (isRender) {
    return memoryBooks;
  } else {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return raw ? JSON.parse(raw) : [];
    }
    return [];
  }
}

// データ保存
function saveBooks(data) {
  if (isRender) {
    memoryBooks = data;
  } else {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}

// ---------------------- API ----------------------

// 保存済みの本を返す
app.get("/list", (req, res) => {
  res.json(getBooks());
});

// 本を保存
app.post("/save", (req, res) => {
  const newItem = req.body;
  const current = getBooks();

  const exists = current.some(book => book.title === newItem.title);
  if (exists) {
    return res.json({ message: "すでに保存されています" });
  }

  current.push(newItem);
  saveBooks(current);

  res.json({ message: "保存しました" });
});

// 本を削除
app.post("/delete", (req, res) => {
  const { title } = req.body;
  let current = getBooks();

  const before = current.length;
  current = current.filter(book => book.title !== title);

  if (current.length === before) {
    return res.json({ message: "その本は保存されていません" });
  }

  saveBooks(current);

  res.json({ message: "削除しました" });
});

// ---------------------- 起動 ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  console.log(isRender ? "Running on Render (memory mode)" : "Running locally (JSON mode)");
});
