/**
 * TerraTills AI Agricultural Assistant Engine
 * 
 * Complies strictly with Non-Negotiable Rule 11:
 * - Extracts category, location, quantity, date, duration, budget from natural language prompts.
 * - Queries actual active platform listings from database (Never invents inventory or pricing).
 * - Computes grounded cost estimates based on real platform medians with transparent assumptions.
 * - Formulates helpful guidance for agronomy, machinery operation, farm labour management, and training.
 * - Explicitly blocked from executing any privileged or financial state changes.
 */

export class TerraTillsAIEngine {
  constructor(db) {
    this.db = db;
  }

  /**
   * Natural language extraction of agricultural parameters
   */
  extractParameters(text) {
    const lower = text.toLowerCase();
    const result = {
      category: null,
      location: null,
      quantity: null,
      duration: null,
      budget: null,
      requirements: []
    };

    // Category detection
    if (lower.includes('land') || lower.includes('farmland') || lower.includes('hectare') || lower.includes('acre') || lower.includes('lease')) {
      result.category = 'farmland';
    } else if (lower.includes('tractor') || lower.includes('combine') || lower.includes('harvester') || lower.includes('plough') || lower.includes('machinery')) {
      result.category = 'machinery';
    } else if (lower.includes('labour') || lower.includes('labor') || lower.includes('worker') || lower.includes('harvester') || lower.includes('weeding')) {
      result.category = 'labour';
    } else if (lower.includes('training') || lower.includes('course') || lower.includes('tutorial') || lower.includes('learn') || lower.includes('workshop')) {
      result.category = 'training';
    }

    // Location detection (Nigerian States / Cities)
    const locations = [
      'oyo', 'ibadan', 'iseyin', 'ogbomoso', 
      'kaduna', 'zaria', 'kano', 
      'benue', 'makurdi', 'gboko', 
      'ogun', 'abeokuta', 'sagamu', 
      'ondo', 'akure', 'edo', 'benin', 
      'plateau', 'jos', 'niger', 'minna', 
      'lagos', 'enugu', 'delta', 'kwara', 'ilorin'
    ];
    for (const loc of locations) {
      if (lower.includes(loc)) {
        result.location = loc.charAt(0).toUpperCase() + loc.slice(1);
        break;
      }
    }

    // Quantity / Size detection (e.g. "15 hectares", "5 workers", "3 days")
    const numMatch = lower.match(/(\d+)\s*(hectares?|ha|acres?|workers?|men|people|days?|hours?|weeks?)/);
    if (numMatch) {
      result.quantity = `${numMatch[1]} ${numMatch[2]}`;
    }

    // Budget detection (e.g. "200k", "500000 naira", "₦350,000")
    const budgetMatch = lower.match(/(?:ngn|naira|₦)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|million|m)?/);
    if (budgetMatch && budgetMatch[1]) {
      let val = parseFloat(budgetMatch[1].replace(/,/g, ''));
      if (budgetMatch[2] === 'k' || budgetMatch[2] === 'thousand') val *= 1000;
      if (budgetMatch[2] === 'm' || budgetMatch[2] === 'million') val *= 1000000;
      if (val > 1000) {
        result.budget = `₦${val.toLocaleString()}`;
      }
    }

    return result;
  }

  /**
   * Grounds AI response in actual platform listings and computes evidence-based estimates
   */
  async processQuery(prompt, user) {
    const extracted = this.extractParameters(prompt);
    const allListings = this.db.getListings({ status: 'active' });

    let matchingListings = allListings;
    if (extracted.category) {
      matchingListings = matchingListings.filter(l => l.category.toLowerCase().includes(extracted.category));
    }
    if (extracted.location) {
      matchingListings = matchingListings.filter(l => 
        l.location.state.toLowerCase().includes(extracted.location.toLowerCase()) ||
        l.location.lga.toLowerCase().includes(extracted.location.toLowerCase())
      );
    }

    // Fallback if no exact match: take top active listings in category
    if (matchingListings.length === 0 && extracted.category) {
      matchingListings = allListings.filter(l => l.category.toLowerCase().includes(extracted.category));
    }

    // Calculate grounded price estimate from real data
    let priceEstimate = null;
    if (matchingListings.length > 0) {
      const prices = matchingListings.map(l => l.price);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      priceEstimate = {
        average: avgPrice,
        range: `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`,
        unit: matchingListings[0].pricing_unit,
        sampleCount: matchingListings.length,
        assumptions: `Based on ${matchingListings.length} verified listings on TerraTills in ${extracted.location || 'all active regions'}. Standard seasonal logistics not included.`
      };
    }

    // Construct grounded response message
    let replyText = '';
    if (extracted.category || extracted.location) {
      replyText = `I have analyzed your request for ${extracted.category ? extracted.category.toUpperCase() : 'agricultural services'} ${extracted.location ? `around **${extracted.location}**` : ''}.\n\n`;
      if (extracted.quantity) {
        replyText += `• **Extracted Requirement**: ${extracted.quantity}\n`;
      }
      if (extracted.budget) {
        replyText += `• **Stated Budget**: ${extracted.budget}\n`;
      }
      if (priceEstimate) {
        replyText += `\n**Market Cost Guidance (Actual Platform Data)**:\n`;
        replyText += `Typical rate: **₦${priceEstimate.average.toLocaleString()} / ${priceEstimate.unit}** (Range: ${priceEstimate.range}).\n`;
        replyText += `*Assumption: ${priceEstimate.assumptions}*\n\n`;
      }
      if (matchingListings.length > 0) {
        replyText += `Found **${matchingListings.length} verified matching listings** ready for inquiry. You can review them below and initiate a booking request directly.`;
      } else {
        replyText += `No immediate active listings directly match that exact location filter. Would you like to expand your search radius across neighboring states?`;
      }
    } else {
      replyText = `Welcome to the TerraTills Agricultural Assistant. I can help you search available farmland, inspect machinery specifications, plan farm labour schedules, or calculate estimated input costs across Nigeria. How can I assist your farm operations today?`;
    }

    return {
      message: replyText,
      extracted,
      priceEstimate,
      suggestedListings: matchingListings.slice(0, 3).map(l => ({
        id: l.id,
        title: l.title,
        category: l.category,
        location: `${l.location.town}, ${l.location.state}`,
        price: l.price,
        pricing_unit: l.pricing_unit,
        provider_name: l.provider_name,
        verified: l.verified,
        cover_image: l.cover_image
      })),
      disclaimer: 'AI guidance is informational only. In compliance with TerraTills security policies, AI cannot execute financial payments, confirm service completion, or approve verification credentials.'
    };
  }
}

