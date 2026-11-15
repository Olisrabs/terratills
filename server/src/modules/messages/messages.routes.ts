import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';
import { z } from 'zod';
import { forbidden, notFound } from '../../lib/errors.js';

const router = Router();

const sendMessageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(5000),
});

// GET /api/messages — list user's conversations (linked to bookings)
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await supabase
      .from('bookings')
      .select(
        `id, status, updated_at,
         listing:listings(title, images),
         customer:users!bookings_customer_id_fkey(id, display_name, avatar_url),
         provider:users!bookings_provider_id_fkey(id, display_name, avatar_url),
         conversations(id)`
      )
      .or(`customer_id.eq.${req.user!.id},provider_id.eq.${req.user!.id}`)
      .not('conversations', 'is', null)
      .order('updated_at', { ascending: false });
    res.json({ conversations: data ?? [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:conversationId — get messages in a conversation
router.get('/:conversationId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: convo } = await supabase
      .from('conversations')
      .select('id, booking_id')
      .eq('id', req.params.conversationId)
      .single();

    if (!convo) throw notFound('Conversation');

    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id, provider_id')
      .eq('id', (convo as Record<string, unknown>)['booking_id'])
      .single();

    if (
      !booking ||
      ((booking as Record<string, unknown>)['customer_id'] !== req.user!.id &&
        (booking as Record<string, unknown>)['provider_id'] !== req.user!.id)
    ) {
      throw forbidden('Access denied.');
    }

    const { data: messages } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(id, display_name, avatar_url)')
      .eq('conversation_id', req.params.conversationId)
      .order('created_at', { ascending: true });

    res.json({ messages: messages ?? [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/messages/:conversationId — send a message
router.post('/:conversationId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = sendMessageSchema.parse(req.body);

    const { data: convo } = await supabase
      .from('conversations')
      .select('id, booking_id')
      .eq('id', req.params.conversationId)
      .single();

    if (!convo) throw notFound('Conversation');

    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id, provider_id')
      .eq('id', (convo as Record<string, unknown>)['booking_id'])
      .single();

    if (
      !booking ||
      ((booking as Record<string, unknown>)['customer_id'] !== req.user!.id &&
        (booking as Record<string, unknown>)['provider_id'] !== req.user!.id)
    ) {
      throw forbidden('Access denied.');
    }

    const { data: message } = await supabase
      .from('messages')
      .insert({
        conversation_id: req.params.conversationId,
        sender_id: req.user!.id,
        body,
      })
      .select('*, sender:users!messages_sender_id_fkey(id, display_name, avatar_url)')
      .single();

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

export default router;
