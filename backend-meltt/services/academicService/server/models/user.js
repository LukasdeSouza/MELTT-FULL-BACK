// Bibliotecas
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Modulos
import pool from "../db.js";

async function createUser({ aluno_id, email, documento, senha, tipo, id_bling }) {
  const hashedPassword = await bcrypt.hash(senha, 10);
  console.log(hashedPassword);

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (aluno_id, email, documento, senha, tipo, id_bling) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [aluno_id, email, documento || null, hashedPassword, tipo, id_bling || null]
    );
    return { id: result.rows[0].id, email, tipo };
  } catch (err) {
    console.log('err', err);
    throw err;
  }
}


async function findUserByEmail(email) {
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
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