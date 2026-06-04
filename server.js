js
 
// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const router = express.Router();

// Usuário fixo apenas para exemplo; em produção use DB com hash
const USER = { username: 'adm', passwordHash: bcrypt.hashSync('1234', 10) };

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== 'adm') return res.status(401).json({ message: 'Credenciais inválidas' });
  const ok = await bcrypt.compare(password, USER.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

  const token = jwt.sign({ user: username }, process.env.JWT_SECRET || 'change-me-in-prod', { expiresIn: '1h' });
  res.json({ token });
});

router.post('/logout', (req, res) => {
  // Em stateless JWT, logout pode ser tratado no client (ou com blacklist)
  res.json({ success: true });
});

export default router;
