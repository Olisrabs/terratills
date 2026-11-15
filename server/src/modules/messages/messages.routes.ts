import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';
import { forbidden, notFound, badRequest } from '../../lib/errors.js';

const router = Router();

// GET /api/messages — list user's conversations (linked to bookings)
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
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

    if (error) throw error;

    const formattedConversations = (data ?? []).map((b: Record<string, unknown>) => {
      const conv = Array.isArray(b.conversations) ? b.conversations[0] : b.conversations;
      const convId = (conv as Record<string, unknown>)?.id || b.id;
      const listing = b.listing as Record<string, unknown> | null;
      const customer = b.customer as Record<string, unknown> | null;
      const provider = b.provider as Record<string, unknown> | null;
      const otherUser = b.customer_id === req.user!.id ? provider : customer;

      return {
        id: convId,
        conversation_id: convId,
        booking_id: b.id,
        booking_status: b.status,
        service_title: listing?.title || 'Agricultural Booking',
        participant_name: otherUser?.display_name || 'Participant',
        participant_avatar: otherUser?.avatar_url || null,
        last_message: 'Conversation started',
        updated_at: b.updated_at,
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:conversationId — get messages
router.get('/:conversationId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const convId = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;

    // Check if conversation exists, or fallback if passed booking_id directly
    let { data: convo } = await supabase
      .from('conversations')
      .select('id, booking_id')
      .eq('id', convId)
      .single();

    if (!convo) {
      const { data: convoByBooking } = await supabase
        .from('conversations')
        .select('id, booking_id')
        .eq('booking_id', convId)
        .single();
      convo = convoByBooking;
    }

    if (!convo) throw notFound('Conversation');

    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id, provider_id')
      .eq('id', convo.booking_id)
      .single();

    if (!booking || (booking.customer_id !== req.user!.id && booking.provider_id !== req.user!.id)) {
      throw forbidden('Access denied');
    }

    const { data: rawMessages, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(id, display_name, avatar_url)')
      .eq('conversation_id', convo.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const messages = (rawMessages ?? []).map((m: Record<string, unknown>) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      text: m.body,
      body: m.body,
      sender_name: (m.sender as Record<string, unknown>)?.display_name || 'User',
      sender_avatar: (m.sender as Record<string, unknown>)?.avatar_url || null,
      is_me: m.sender_id === req.user!.id,
      timestamp: m.created_at,
      created_at: m.created_at,
    }));

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// Send message handler
async function handleSendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const convId = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
    const bodyText = (req.body.body || req.body.text || req.body.message || '').trim();

    if (!bodyText) throw badRequest('Message content is required');

    let { data: convo } = await supabase
      .from('conversations')
      .select('id, booking_id')
      .eq('id', convId)
      .single();

    if (!convo) {
      const { data: convoByBooking } = await supabase
        .from('conversations')
        .select('id, booking_id')
        .eq('booking_id', convId)
        .single();
      convo = convoByBooking;
    }

    if (!convo) throw notFound('Conversation');

    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id, provider_id')
      .eq('id', convo.booking_id)
      .single();

    if (!booking || (booking.customer_id !== req.user!.id && booking.provider_id !== req.user!.id)) {
      throw forbidden('Access denied');
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convo.id,
        sender_id: req.user!.id,
        body: bodyText,
      })
      .select('*, sender:users!messages_sender_id_fkey(id, display_name, avatar_url)')
      .single();

    if (error || !message) throw new Error('Failed to send message');

    const formatted = {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      text: message.body,
      body: message.body,
      sender_name: message.sender?.display_name || 'User',
      sender_avatar: message.sender?.avatar_url || null,
      is_me: true,
      timestamp: message.created_at,
      created_at: message.created_at,
    };

    res.status(201).json({ message: formatted });
  } catch (err) {
    next(err);
  }
}

router.post('/:conversationId', requireAuth, handleSendMessage);
router.post('/:conversationId/send', requireAuth, handleSendMessage);

export default router;
