// Bibliotecas
import express from 'express';
import bcrypt from "bcryptjs";

// Modulos
import { createUser, findUserByEmail, verifyPassword, generateToken } from '../models/User';
import authMiddleware from '../middlewares/auth';
import connection from '../db';

// Instâncias
const router = express.Router();

// Rotas
router.post('/register', async (req, res) => {
  const { aluno_id, email, senha, tipo } = req.body;
  console.log('req.body', req.body)
  if(!aluno_id |!email || !senha || !tipo) {
    return res.status(400).json({ error: 'Nome, E-mail, Senha e Tipo são obrigatórios' });
  }

  const user = await findUserByEmail(email);
  if (user) {
    return res.status(400).json({ error: 'E-mail já cadastrado' });
  }
  
  try {
    const user = await createUser({ aluno_id, email, senha, tipo });
    res.status(201).json({ user, message: "Usuário gerado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: 'Houve um erro realizar seu cadastro. Tente novamente mais tarde' });
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await findUserByEmail(email);
    console.log('user', user);
    if (!user) {
      return res.status(401).json({ error: 'E-mail não cadastrado' });
    }
    if (user.senha !== senha) {
      return res.status(401).json({ error: 'Senha Incorreta' });
    }
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'Feature in progress. Please wait' });

    // const resetToken = generateToken(user);
    // const resetLink = `http://localhost:5000/reset-password/${resetToken}`;

    // // Enviar e-mail usando Amazon SES
    // const params = {
    //   Source: 'your_verified_email@example.com',
    //   Destination: {
    //     ToAddresses: [email]
    //   },
    //   Message: {
    //     Subject: {
    //       Data: 'Password Reset'
    //     },
    //     Body: {
    //       Text: {
    //         Data: `Reset your password by clicking on the following link: ${resetLink}`
    //       }
    //     }
    //   }
    // };

    // ses.sendEmail(params, (err, data) => {
    //   if (err) {
    //     console.error(err, err.stack);
    //     res.status(500).json({ error: 'Failed to send password reset email' });
    //   } else {
    //     res.json({ message: 'Password reset link sent' });
    //   }
    // });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

router.post('/reset-password/', authMiddleware, async (req, res) => {
  const { email, senha } = req.body;
  console.log('email', email)
  console.log('senha', senha)

  try {
    const user = await findUserByEmail(email);
    console.log('user =====>', user)

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPassword = await bcrypt.hash(senha, 10);
    console.log('newPassword', newPassword)
    // user.senha = await bcrypt.hash(senha, 10);
    connection.query('UPDATE usuarios SET senha = ? WHERE id = ?', [newPassword, user.id]);
    res.json({ message: 'Senha resetada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    const [user] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha ao deletar o usuário' });
  }
});


export default router;
