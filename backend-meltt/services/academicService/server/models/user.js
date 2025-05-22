// Bibliotecas
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Modulos
import db from "../db";

async function createUser({ aluno_id, email, documento, senha, tipo, id_bling }) {
  const hashedPassword = await bcrypt.hash(senha, 10);
  console.log(hashedPassword);

  return new Promise((resolve, reject) => {
    const query = "INSERT INTO usuarios (aluno_id, email, documento, senha, tipo, id_bling) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [aluno_id, email, documento || null, hashedPassword, tipo, id_bling || null], (err, results) => {
      console.log('err', err);
      console.log('results', results);
      if (err) return reject(err);

      resolve({ id: results.insertId, email, tipo });
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
    { id: user.id, tipo: user.tipo, nome: user.nome, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export default { createUser, findUserByEmail, verifyPassword, generateToken };