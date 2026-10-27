import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/fees  (admin/teacher: all; student: own; parent: children's)
router.get('/', (req: Request, res: Response) => {
  if (req.user!.role === 'admin' || req.user!.role === 'teacher') {
    const fees = query(`
      SELECT f.*, u.full_name as student_name, u.email as student_email, b.name as batch_name 
      FROM fees f
      JOIN users u ON u.id = f.student_id 
      LEFT JOIN batches b ON b.id = f.batch_id 
      ORDER BY f.created_at DESC
    `);
    res.json({ fees });
    return;
  }

  const studentId = req.user!.role === 'student' ? req.user!.id : (req.query.student_id as string);
  if (!studentId) {
    res.status(400).json({ error: 'student_id required' });
    return;
  }
  const fees = query(
    `SELECT f.*, b.name as batch_name 
     FROM fees f
     LEFT JOIN batches b ON b.id = f.batch_id 
     WHERE f.student_id = ? 
     ORDER BY f.due_date DESC`,
    [studentId]
  );
  res.json({ fees });
});

// GET /api/fees/:id
router.get('/:id', (req: Request, res: Response) => {
  const fee = get(
    `SELECT f.*, u.full_name as student_name, b.name as batch_name 
     FROM fees f
     JOIN users u ON u.id = f.student_id 
     LEFT JOIN batches b ON b.id = f.batch_id 
     WHERE f.id = ?`,
    [req.params.id]
  );
  if (!fee) {
    res.status(404).json({ error: 'Fee record not found' });
    return;
  }
  const payments = query(
    'SELECT * FROM payments WHERE fee_id = ? ORDER BY payment_date DESC',
    [req.params.id]
  );
  res.json({ fee, payments });
});

// POST /api/fees  (admin only)
router.post('/', authorize('admin'), (req: Request, res: Response) => {
  const { student_id, batch_id, amount, due_date, remarks, description } = req.body;
  if (!student_id || !amount || !due_date) {
    res.status(400).json({ error: 'student_id, amount, and due_date are required' });
    return;
  }

  // Validate student exists
  const student = get('SELECT id FROM users WHERE id = ?', [student_id]);
  if (!student) {
    res.status(404).json({ error: 'Student account not found' });
    return;
  }

  // Resolve batch_id to ensure foreign key constraint is satisfied
  let targetBatchId = batch_id;
  if (!targetBatchId) {
    const enrolledBatch = get<any>(
      'SELECT batch_id FROM batch_enrollments WHERE student_id = ? LIMIT 1',
      [student_id]
    );
    if (enrolledBatch?.batch_id) {
      targetBatchId = enrolledBatch.batch_id;
    } else {
      const defaultBatch = get<any>('SELECT id FROM batches LIMIT 1');
      targetBatchId = defaultBatch?.id;
    }
  }

  if (!targetBatchId) {
    res.status(400).json({ error: 'Please create at least one batch before creating fee records' });
    return;
  }

  const id = 'fee-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const note = remarks || description || '';

  run(
    `INSERT INTO fees (
      id, student_id, batch_id, amount, paid_amount, due_date, status, remarks
    ) VALUES (?, ?, ?, ?, 0.0, ?, 'unpaid', ?)`,
    [id, student_id, targetBatchId, Number(amount), due_date, note]
  );

  const created = get('SELECT * FROM fees WHERE id = ?', [id]);
  res.status(201).json({ fee: created, message: 'Fee record created successfully' });
});

// PUT & PATCH /api/fees/:id  (admin only: update fee details)
const updateFeeHandler = (req: Request, res: Response) => {
  const fee = get<any>('SELECT * FROM fees WHERE id = ?', [req.params.id]);
  if (!fee) {
    res.status(404).json({ error: 'Fee record not found' });
    return;
  }

  const { amount, paid_amount, due_date, remarks, description, status, batch_id } = req.body;
  const updates: string[] = [];
  const vals: any[] = [];

  if (amount !== undefined) {
    updates.push('amount = ?');
    vals.push(Number(amount));
  }
  if (paid_amount !== undefined) {
    updates.push('paid_amount = ?');
    vals.push(Number(paid_amount));
  }
  if (due_date !== undefined) {
    updates.push('due_date = ?');
    vals.push(due_date);
  }
  if (remarks !== undefined || description !== undefined) {
    updates.push('remarks = ?');
    vals.push(remarks !== undefined ? remarks : description);
  }
  if (batch_id !== undefined) {
    updates.push('batch_id = ?');
    vals.push(batch_id);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    vals.push(status);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields provided to update' });
    return;
  }

  vals.push(req.params.id);
  run(`UPDATE fees SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals);

  // Recalculate status if amount changed
  if (amount !== undefined) {
    const currentPaid = fee.paid_amount || 0;
    const newStatus = currentPaid >= Number(amount) ? 'paid' : currentPaid > 0 ? 'partial' : 'unpaid';
    run('UPDATE fees SET status = ? WHERE id = ?', [newStatus, req.params.id]);
  }

  const updated = get(
    `SELECT f.*, u.full_name as student_name, b.name as batch_name 
     FROM fees f
     JOIN users u ON u.id = f.student_id 
     LEFT JOIN batches b ON b.id = f.batch_id 
     WHERE f.id = ?`,
    [req.params.id]
  );
  res.json({ fee: updated, message: 'Fee record updated successfully' });
};
router.put('/:id', authorize('admin'), updateFeeHandler);
router.patch('/:id', authorize('admin'), updateFeeHandler);

// DELETE /api/fees/:id  (admin only)
router.delete('/:id', authorize('admin'), (req: Request, res: Response) => {
  const fee = get<any>('SELECT id FROM fees WHERE id = ?', [req.params.id]);
  if (!fee) {
    res.status(404).json({ error: 'Fee record not found' });
    return;
  }

  run('DELETE FROM fees WHERE id = ?', [req.params.id]);
  res.json({ message: 'Fee record deleted successfully' });
});

// POST /api/fees/:id/payment  (admin only: collect payment)
router.post('/:id/payment', authorize('admin'), (req: Request, res: Response) => {
  const fee = get<any>('SELECT * FROM fees WHERE id = ?', [req.params.id]);
  if (!fee) {
    res.status(404).json({ error: 'Fee record not found' });
    return;
  }

  const { amount, method, transaction_ref } = req.body;
  const payAmount = Number(amount);
  if (!payAmount || payAmount <= 0) {
    res.status(400).json({ error: 'Payment amount must be greater than zero' });
    return;
  }

  const remaining = Math.max(0, fee.amount - (fee.paid_amount || 0));
  if (payAmount > remaining && remaining > 0) {
    // We allow full payment, but warn or accept
  }

  const payId = 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const receiptNo = 'REC-' + Date.now().toString().slice(-8);

  run(
    `INSERT INTO payments (
      id, fee_id, student_id, amount, method, transaction_ref, receipt_no, recorded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payId,
      fee.id,
      fee.student_id,
      payAmount,
      method || 'Cash',
      transaction_ref || null,
      receiptNo,
      req.user!.id,
    ]
  );

  const newPaid = Number(((fee.paid_amount || 0) + payAmount).toFixed(2));
  const newStatus = newPaid >= fee.amount ? 'paid' : 'partial';

  run(
    `UPDATE fees 
     SET paid_amount = ?, status = ?, payment_date = datetime('now'), method = ?, receipt_no = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [newPaid, newStatus, method || 'Cash', receiptNo, fee.id]
  );

  const updatedFee = get(
    `SELECT f.*, u.full_name as student_name, b.name as batch_name 
     FROM fees f
     JOIN users u ON u.id = f.student_id 
     LEFT JOIN batches b ON b.id = f.batch_id 
     WHERE f.id = ?`,
    [fee.id]
  );

  res.json({
    fee: updatedFee,
    payment_id: payId,
    receipt_no: receiptNo,
    message: 'Payment recorded successfully',
  });
});

export default router;