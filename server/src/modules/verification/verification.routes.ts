import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';

const router = Router();

// GET /api/verification
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { data: verifications, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedSubmissions = (verifications ?? []).map((v: Record<string, unknown>) => ({
      id: v.id,
      type: v.type,
      type_title: (v.type as string).charAt(0).toUpperCase() + (v.type as string).slice(1) + ' Verification',
      status: v.status,
      submitted_at: v.created_at,
      documents: Array.isArray(v.submitted_documents)
        ? (v.submitted_documents as string[]).map(doc => ({ name: doc }))
        : [],
      notes: v.decision_note || '',
    }));

    const accountVerification = {
      level: 1,
      identity: formattedSubmissions.find(s => s.type === 'identity')?.status || 'pending',
      farmland: formattedSubmissions.find(s => s.type === 'farmland')?.status || 'unverified',
      machinery: formattedSubmissions.find(s => s.type === 'machinery')?.status || 'unverified',
    };

    res.json({
      verifications: formattedSubmissions,
      submissions: formattedSubmissions,
      accountVerification,
    });
  } catch (err) {
    next(err);
  }
});

// Handler for submitting verification
async function handleSubmitVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const b = req.body;
    let type = b.type || 'identity';
    if (type === 'farmland_authority') type = 'farmland';
    if (type === 'machinery_ownership') type = 'machinery';

    const docs = Array.isArray(b.documents)
      ? b.documents.map((d: { name?: string } | string) => (typeof d === 'string' ? d : d.name || 'document.pdf'))
      : Array.isArray(b.submitted_documents) ? b.submitted_documents : [];

    const { data: verification, error } = await supabase
      .from('verifications')
      .insert({
        user_id: userId,
        type,
        submitted_documents: docs,
        decision_note: b.notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !verification) throw new Error('Failed to record verification');

    res.status(201).json({
      success: true,
      message: 'Verification documents submitted for review',
      verification,
    });
  } catch (err) {
    next(err);
  }
}

router.post('/', requireAuth, handleSubmitVerification);
router.post('/submit', requireAuth, handleSubmitVerification);

export default router;
