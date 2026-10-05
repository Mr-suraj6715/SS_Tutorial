import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/fees  (admin: all; student: own)
router.get('/', (req: Request, res: Response) => {
  if (req.user!.role === 'admin' || req.user!.role === 'teacher') {
    const fees = query(`SELECT f.*, u.full_name as student_name, b.name as batch_name FROM fees f
      JOIN users u ON u.id = f.student_id LEFT JOIN batches b ON b.id = f.batch_id ORDER BY f.due_date DESC`);
    res.json({ fees }); return;
  }
  const studentId = req.user!.role === 'student' ? req.user!.id : req.query.student_id as string;
  if (!studentId) { res.status(400).json({ error: 'student_id required' }); return; }
  const fees = query(`SELECT f.*, b.name as batch_name FROM fees f
    LEFT JOIN batches b ON b.id = f.batch_id WHERE f.student_id = ? ORDER BY f.due_date DESC`, [studentId]);
  res.json({ fees });
});

// POST /api/fees  (admin)
router.post('/', authorize('admin'), (req: Request, res: Response) => {
  const { student_id, batch_id, amount, due_date, description } = req.body;
  if (!student_id || !amount || !due_date) { res.status(400).json({ error: 'student_id, amount, due_date required' }); return; }
  const id = 'fee-' + Date.now();
  run('INSERT INTO fees (id, student_id, batch_id, amount, due_date, description) VALUES (?,?,?,?,?,?)',
    [id, student_id, batch_id || null, amount, due_date, description || null]);
  res.status(201).json({ fee: get('SELECT * FROM fees WHERE id = ?', [id]) });
});

// POST /api/fees/:id/payment  (admin)
router.post('/:id/payment', authorize('admin'), (req: Request, res: Response) => {
  const fee = get<any>('SELECT * FROM fees WHERE id = ?', [req.params.id]);
  if (!fee) { res.status(404).json({ error: 'Fee record not found' }); return; }
  const { amount, method, transaction_ref } = req.body;
  const payId = 'pay-' + Date.now();
  const receiptNo = 'REC-' + Date.now();
  run('INSERT INTO payments (id, fee_id, student_id, amount, method, transaction_ref, receipt_no, recorded_by) VALUES (?,?,?,?,?,?,?,?)',
    [payId, fee.id, fee.student_id, amount, method || 'Cash', transaction_ref || null, receiptNo, req.user!.id]);
  const newPaid = (fee.paid_amount || 0) + Number(amount);
  const status = newPaid >= fee.amount ? 'paid' : 'partial';
  run('UPDATE fees SET paid_amount = ?, status = ?, payment_date = CURRENT_DATE, method = ?, receipt_no = ? WHERE id = ?',
    [newPaid, status, method || 'Cash', receiptNo, fee.id]);
  res.json({ fee: get('SELECT * FROM fees WHERE id = ?', [fee.id]), payment_id: payId, receipt_no: receiptNo });
});

export default router;