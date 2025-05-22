import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db"; // Importa a conexão com o banco de dados

async function createUser({ aluno_id, email, senha, tipo }) {
  const hashedPassword = await bcrypt.hash(senha, 10);
  console.log(hashedPassword);
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO usuarios (aluno_id, email, senha, tipo) VALUES (?, ?, ?, ?)";
    db.query(query, [aluno_id, email, hashedPassword, tipo], (err, results) => {
      console.log('err', err);
      console.log('results', results);
      if (err) return reject(err);

      resolve({ id: results.id, email, tipo });
    });
  });
}

async function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM usuarios WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

async function verifyPassword(storedPassword, password) {
  return bcrypt.compare(password, storedPassword);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, tipo: user.tipo, nome: user.nome, email: user.email, documento: user.documento },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export default { createUser, findUserByEmail, verifyPassword, generateToken };
