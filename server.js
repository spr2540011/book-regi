const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/list",(req,res)=>{
    const filePath="./book.json";

    try{
        if(fs.existsSync(filePath)){
            const raw = fs.readFileSync(filePath,"utf-8");
            const data = raw ? JSON.parse(raw) : [];
            return res.json(data);
        }else{
            return res.json([]);
        }
    }catch(e){
        return res.json([]);
    }
})

// 本を保存する処理
app.post("/save", (req, res) => {
    const newItem = req.body;
    const filePath = "./books.json";

    // jsonの読み込み
    let current = [];

    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, "utf-8");
            current = raw ? JSON.parse(raw) : [];
        }
    } catch (e) {
        current = []; 
    }
    // すでに保存されていないかのチェック
    const exists = current.some(book => book.title ===newItem.title);
    // 保存されていた場合の文
    if(exists){
        return res.json({message:"すでに保存されています"});
    }

    // 新しい本を保存
    current.push(newItem);

    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));

    res.json({ message: "保存しました" });

});

// 本を削除する処理
app.post("/delete",(req,res)=>{
    const {title} =req.body;
    const filePath = "./books.json";

    // jsonファイルの読み込み
    let current = [];

    try{
        if(fs.existsSync(filePath)){
            const raw = fs.readFileSync(filePath, "utf-8");
            current = raw ? JSON.parse(raw) : [];
        }
    }catch(e){
        current = [];
    }

    // 削除処理
    const before = current.length;

    current = current.filter(book => book.title !== title);
    //本が保存されていない場合の処理
    if(current.length === before){
        return res.json({message: "その本は保存されていません"});
    }
    // jsonの書き戻し
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));

    res.json({message:"削除しました"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

