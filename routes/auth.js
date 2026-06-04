js
 
// routes/networks.js
import express from 'express';
const router = express.Router();

// Mock data (substitua por DB)
let networks = [
  { id: 'net-01', name: 'Escritório Principal', locked: false, quotaGigs: 100 },
  { id: 'net-02', name: 'Zona de Visitantes', locked: true, quotaGigs: 50 },
  { id: 'net-03', name: 'Auditório', locked: false, quotaGigs: 75 }
];

// Listar redes
router.get('/networks', (req, res) => {
  res.json({ networks });
});

// Bloquear/desbloquear
router.post('/networks/:id/lock', (req, res) => {
  const net = networks.find(n => n.id === req.params.id);
  if (net) { net.locked = true; return res.json({ success: true }); }
  res.json({ success: false, message: 'Rede não encontrada' });
});

router.post('/networks/:id/unlock', (req, res) => {
  const net = networks.find(n => n.id === req.params.id);
  if (net) { net.locked = false; return res.json({ success: true }); }
  res.json({ success: false, message: 'Rede não encontrada' });
});

// Quota
router.put('/networks/:id/quota', (req, res) => {
  const { quotaGigs } = req.body;
  const net = networks.find(n => n.id === req.params.id);
  if (net && typeof quotaGigs === 'number') { net.quotaGigs = quotaGigs; return res.json({ success: true }); }
  res.json({ success: false, message: 'Dados inválidos' });
});

// Senha (para demonstração; na prática, esse fluxo deve ser seguro)
router.put('/networks/:id/password', (req, res) => {
  // Aqui você chamaria o deviceManager para atualizar a senha no dispositivo
  res.json({ success: true });
});

export default router;
