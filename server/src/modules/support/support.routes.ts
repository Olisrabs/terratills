import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';

const router = Router();

const FAQS = [
  {
    id: 'faq_1',
    category: 'payments',
    question: 'How do payments work on TerraTills?',
    answer: 'Payments are made securely via Bach. Once terms are agreed, funds are held by the platform and only released to the service provider after both parties confirm delivery.',
  },
  {
    id: 'faq_2',
    category: 'verification',
    question: 'What documents do I need to get verified?',
    answer: 'For identity verification, provide a valid NIN, Driver’s Licence, or Voter’s Card. For machinery and farmland, upload title deeds, survey plans, or equipment registration papers.',
  },
  {
    id: 'faq_3',
    category: 'disputes',
    question: 'What happens if a service is not delivered as agreed?',
    answer: 'You can raise a dispute on the booking details page before confirming completion. Funds will remain securely on hold while our support team investigates and mediates.',
  },
  {
    id: 'faq_4',
    category: 'general',
    question: 'What are the platform fees?',
    answer: 'Customer markup is 0%. A 5% platform commission is deducted from the provider’s payout upon verified completion.',
  },
];

// GET /api/support/faqs
router.get('/faqs', (_req: Request, res: Response) => {
  res.json(FAQS);
});

// GET /api/support/tickets
router.get('/tickets', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const tickets = (data ?? []).map((t: Record<string, unknown>) => ({
      ...t,
      reference: `TICK-${(t.id as string).slice(0, 8).toUpperCase()}`,
      category: 'general',
      description: t.body,
      conversation: [
        { sender: 'user', text: t.body, timestamp: t.created_at }
      ],
    }));

    res.json(tickets);
  } catch (err) {
    next(err);
  }
});

// Handler for creating tickets
async function handleCreateTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const b = req.body;
    const subject = (b.subject || 'Support Ticket').trim();
    const body = (b.description || b.body || '').trim();

    if (!body) {
      res.status(400).json({ error: 'Description is required' });
      return;
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: req.user!.id,
        subject,
        body,
        status: 'open',
      })
      .select()
      .single();

    if (error || !ticket) throw new Error('Failed to create support ticket');

    const formatted = {
      ...ticket,
      reference: `TICK-${ticket.id.slice(0, 8).toUpperCase()}`,
      description: ticket.body,
    };

    res.status(201).json({ success: true, ticket: formatted });
  } catch (err) {
    next(err);
  }
}

router.post('/tickets', requireAuth, handleCreateTicket);
router.post('/tickets/new', requireAuth, handleCreateTicket);

// POST /api/support/tickets/:id/reply
router.post('/tickets/:id/reply', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { message } = req.body;

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Reply recorded successfully',
      reply: {
        sender: 'user',
        text: message,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
