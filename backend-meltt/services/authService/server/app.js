// Bibliotecas
import express from "express";
import cors from "cors";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authMiddleware from "./middlewares/auth/index.js";
import bodyParser from "body-parser";
import axios from "axios";
import "dotenv/config";

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET;
// const selfPingUrl = process.env.SELF_PING_URL

const corsOptions = { origin: true };
app.use(cors(corsOptions));


async function createUser({ aluno_id, nome, email, senha, tipo }) {
  const hashedPassword = await bcrypt.hash(senha, 10);
  try {
    const [results] = await pool.query(
      "INSERT INTO usuarios (aluno_id, nome, email, senha, tipo) VALUES (?, ?, ?, ?, ?)",
      [aluno_id, nome, email, hashedPassword, tipo]
    );
    return { id: results.insertId, email, tipo };
  } catch (err) {
    console.log("Erro ao criar usuário:", err);
    throw err;
  }
}

async function findUserByEmail(email) {
  try {
    const [results] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    return results[0];
  } catch (err) {
    console.log("Erro ao buscar usuário:", err);
    throw err;
  }
}

async function verifyPassword(storedPassword, password) {
  return bcrypt.compare(password, storedPassword);
}

function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      tipo: user.tipo, 
      nome: user.nome, 
      email: user.email, 
      turma_id: user.turma_id, 
      id_bling: user.id_bling 
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
}

app.post("/api/users/register", async (req, res) => {
  const { aluno_id, nome, email, senha, tipo } = req.body;
  console.log("req.body", req.body);
  if (!nome || !email || !senha || !tipo) {
    return res
      .status(400)
      .json({ error: "Nome, E-mail, Senha e Tipo são obrigatórios" });
  }

  const user = await findUserByEmail(email);
  if (user) {
    return res.status(400).json({ error: "E-mail já cadastrado" });
  }

  try {
    const user = await createUser({ aluno_id, nome, email, senha, tipo });
    res.status(201).json({ user, message: "Usuário gerado com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "Houve um erro realizar seu cadastro. Tente novamente mais tarde",
      });
  }
});

app.post("/api/users/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await findUserByEmail(email);
    console.log("user", user);
    if (!user) {
      return res.status(401).json({ error: "E-mail não cadastrado" });
    }
    if (user.senha !== senha) {
      return res.status(401).json({ error: "Senha incorreta" });
    }
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
});

app.post("/api/users/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "Feature in progress. Please wait" });

  } catch (error) {
    res.status(500).json({ error: "Failed to send password reset email" });
  }
});

app.post("/api/users/reset-password/", authMiddleware, async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newPassword = await bcrypt.hash(senha, 10);
    await pool.query("UPDATE usuarios SET senha = ? WHERE id = ?", [newPassword, user.id]);
    res.json({ message: "Senha resetada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao resetar senha" });
  }
});

app.delete("/api/users/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    const [users] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao deletar o usuário" });
  }
});

app.get("/api/users/getByTipo", authMiddleware, async (req, res) => {
  const { tipo } = req.query;

  if (!tipo) {
    return res.status(400).json({ error: "O parâmetro 'tipo' é obrigatório" });
  }

  try {
    const [users] = await pool.query("SELECT * FROM usuarios WHERE tipo = ?", [tipo]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: `Nenhum usuário encontrado para o tipo ${tipo}` });
    }

    res.json({ result: users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Falha ao retornar usuários para este TIPO" });
  }
});

app.post("/api/external/bling/oauth", async (req, res) => {
  const { code } = req.query;

  try {
    const url = "https://www.bling.com.br/Api/v3/oauth/token"; 
    const username = process.env.CLIENT_ID;
    const password = process.env.CLIENT_SECRET; 

    const data = new URLSearchParams();
    if(code) {
      data.append("grant_type", "authorization_code");
      data.append("code", code); 
    }

    const config = {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          "base64"
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios.post(url, data, config);
    console.log('response', response.data);
    const { access_token, refresh_token } = response.data;

    return res.json({
      access_token,
      refresh_token,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

app.post("/api/external/bling/refresh", async (req, res) => {
  const { refresh_token } = req.body; 
  console.log('refresh_token', refresh_token);
  if (!refresh_token) {
    return res.status(400).json({ error: "refresh_token é obrigatório" });
  }

  try {
    const url = "https://www.bling.com.br/Api/v3/oauth/token"; 
    const username = process.env.CLIENT_ID;
    const password = process.env.CLIENT_SECRET;

    const data = new URLSearchParams();
    data.append("grant_type", "refresh_token");
    data.append("refresh_token", refresh_token);

    const config = {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios.post(url, data, config);

    return res.json({
      access_token,
      refresh_token: new_refresh_token,
    });
  } catch (error) {
    console.error("Erro ao atualizar token:", error.response?.data || error.message);
    return res.status(500).json({ 
      error: "Erro ao atualizar token",
      details: error.response?.data || error.message 
    });
  }
});

// app.get('/ping', (req, res) => res.send('pong'));
// setInterval(() => {
//   axios.get(selfPingUrl)
//     .then(() => console.log('Self-ping realizado com sucesso'))
//     .catch((err) => console.error('Erro no self-ping:', err));
// }, 10 * 60 * 1000)

app.get("/", (req, res) => res.send("API AUTH MELTT"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
