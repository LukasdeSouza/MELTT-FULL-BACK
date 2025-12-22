// Bibliotecas
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from 'axios';
import FormData from 'form-data'
// import authMiddleware from "./middlewares/auth";
import multer from "multer";
import "./jobs/blingSync.js";
import "dotenv/config";

// Jobs (apenas em ambiente local, não na Vercel)
// Cron jobs não funcionam em ambiente serverless, então pulamos o import na Vercel
// Usamos import dinâmico para evitar erros em ambiente serverless
if (process.env.VERCEL !== '1') {
  import("./jobs/blingSync.js").catch(() => {
    // Ignora erros silenciosamente
  });
}

// Routes
import routes from "./routes/index.js";
import comercialRoutes from "./routes/comercialRoutes.js";

const uploadMiddleware = multer({ storage: multer.memoryStorage() });

// Configurações
// dotenv já é carregado no db.js quando necessário
// Na Vercel, as variáveis de ambiente já estão disponíveis em process.env

const app = express();
const corsOptions = { origin: "*", credentials: true };

// Middlewares
app.use(bodyParser.json());
app.use(cors(corsOptions));

// Rotas - /api
app.use("/api", routes);
app.use("/api/comercial", comercialRoutes);

// MOMENTÂNEO AQUI NA APP.JS
app.post("/api/d4sign/upload", uploadMiddleware.single('file'), async (req, res) => {
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
        },
        timeout: 30000 // 30 segundos
      }
    );

    res.json({ uuid: response.data.uuid }); // Retorna apenas o UUID
  } catch (error) {
    console.error("Erro no upload:", error.response?.data || error.message);
    res.status(500).json({ error: "Falha no upload de Estatuto" });
  }
});

app.post("/api/d4sign/upload/adesao", uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(
      `https://secure.d4sign.com.br/api/v1/documents/${process.env.D4SIGN_ADESAO_SAFER}/upload`,
      formData,
      {
        params: {
          tokenAPI: process.env.D4SIGN_TOKEN_API,
          cryptKey: process.env.D4SIGN_CRYPTKEY,
        },
        headers: {
          ...formData.getHeaders(),
          "Content-Length": formData.getLengthSync()
        },
        timeout: 30000 // 30 segundos
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
        },
        timeout: 30000 // 30 segundos
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

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handler para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Export para Vercel (serverless)
export default app;

// Server (apenas em ambiente local - não Vercel)
const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(
      `Serviço de GERENCIAMENTO ACADÊMICO MELTT está rodando na porta :${PORT}`
    );
  });
}