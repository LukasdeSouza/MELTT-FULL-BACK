// Bibliotecas
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from 'axios';
import FormData from 'form-data'
// import authMiddleware from "./middlewares/auth";
import multer from "multer";

// Routes
import routes from "./routes/index.js";

const uploadMiddleware = multer({ storage: multer.memoryStorage() });

// Configurações
import "dotenv/config";

const app = express();
const corsOptions = { origin: "*", credentials: true };

// Middlewares
app.use(bodyParser.json());
app.use(cors(corsOptions));

// Rotas - /api
app.use("/api", routes);

// MOMENTÂNEO AQUI NA APP.JS
app.post("/api/d4sign/estatuto", uploadMiddleware.single('file'), async (req, res) => {
  try {
    console.log('req.file', req.file)
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(
      `https://secure.d4sign.com.br/api/v1/documents/${process.env.D4SIGN_ESTATUTOS_SAFER}/upload`,
      formData,
      {
        params: {
          tokenAPI: process.env.D4SIGN_TOKEN_API,
          cryptKey: process.env.D4SIGN_CRYPTKEY,
        },
        headers: {
          ...formData.getHeaders(),
          "Content-Length": formData.getLengthSync()
        }
      }
    );

    res.json({ uuid: response.data.uuid }); // Retorna apenas o UUID
  } catch (error) {
    console.error("Erro no upload:", error.response?.data || error.message);
    res.status(500).json({ error: "Falha no upload de Estatuto" });
  }
});
app.post("/api/d4sign/contrato-meltt", uploadMiddleware.single('file'), async (req, res) => {
  try {
    console.log('req.file', req.file)
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(
      `https://secure.d4sign.com.br/api/v1/documents/${process.env.D4SIGN_CONTRATO_MELTT_SAFER}/upload`,
      formData,
      {
        params: {
          tokenAPI: process.env.D4SIGN_TOKEN_API,
          cryptKey: process.env.D4SIGN_CRYPTKEY,
        },
        headers: {
          ...formData.getHeaders(),
          "Content-Length": formData.getLengthSync()
        }
      }
    );

    res.json({ uuid: response.data.uuid }); // Retorna apenas o UUID
  } catch (error) {
    console.error("Erro no upload:", error.response?.data || error.message);
    res.status(500).json({ error: "Falha no upload de Estatuto" });
  }
});

app.get("/", (req, res) => {
  res.send("Serviço de GERENCIAMENTO ACADÊMICO MELTT");
});

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(
    `Serviço de GERENCIAMENTO ACADÊMICO MELTT está rodando na porta :${PORT}`
  );
});