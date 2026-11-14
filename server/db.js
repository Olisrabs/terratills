import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { BOOKING_STATES, PAYMENT_STATES, SETTLEMENT_STATES } from './stateMachines.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'terratills_db.json');

// Initial Categories
export const CATEGORIES = [
  {
    slug: 'farmland',
    name: 'Farmland Leasing',
    shortName: 'Farmland',
    description: 'Lease fertile agricultural land across Nigerian states with verified land title & soil profiles.',
    icon: 'Tractor',
    color: 'emerald',
    attributeKeys: ['size', 'unit', 'soil_type', 'water_source', 'topography', 'lease_term', 'title_type']
  },
  {
    slug: 'machinery',
    name: 'Machinery Rental',
    shortName: 'Machinery',
    description: 'Rent commercial tractors, harvesters, disc harrows and sprayers with verified certified operators.',
    icon: 'Truck',
    color: 'blue',
    attributeKeys: ['machine_type', 'make_model', 'horsepower', 'condition', 'operator_included', 'fuel_terms', 'delivery_available']
  },
  {
    slug: 'labour',
    name: 'Farm Labour',
    shortName: 'Labour',
    description: 'Hire vetted, experienced agricultural teams for planting, precision spraying, weeding and harvesting.',
    icon: 'Users',
    color: 'amber',
    attributeKeys: ['crew_size', 'work_type', 'experience_years', 'daily_hours', 'tools_provided', 'accommodation_required']
  },
  {
    slug: 'training',
    name: 'Agricultural Training & Tutorials',
    shortName: 'Training',
    description: 'Practical agronomy masterclasses, livestock management, and export crop processing certificates.',
    icon: 'GraduationCap',
    color: 'purple',
    attributeKeys: ['course_level', 'delivery_mode', 'duration_days', 'certification', 'materials_included', 'instructor_credentials']
  }
];

class Database {
  constructor() {
    this.ensureDirectory();
    this.load();
  }

  ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed to parse database file, re-seeding...', err);
      }
    }
    this.seed();
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file', err);
    }
  }

  seed() {
    this.data = {
      users: [
        {
          id: 'user_1',
          name: 'Alhaji Musa Danladi',
          displayName: 'Musa Danladi',
          email: 'musa.danladi@terratills.ng',
          phone: '+234 803 456 7890',
          role: 'user', // Unified account
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          badge: 'Verified Agro-Pro 🌿',
          bio: 'Commercial grain producer, mechanized farming advocate, and agricultural fleet owner with 15+ years experience in the North-West and Middle Belt corridors.',
          location: {
            state: 'Kaduna',
            lga: 'Zaria',
            town: 'Zaria City',
            country: 'Nigeria'
          },
          memberSince: 'March 2023',
          rating: 4.9,
          reviewCount: 38,
          completedBookingsCount: 52,
          responseRate: '98%',
          responseTime: '< 30 mins',
          verification: {
            identity: { status: 'approved', verifiedAt: '2023-04-10' },
            phone: { status: 'approved', verifiedAt: '2023-03-15' },
            email: { status: 'approved', verifiedAt: '2023-03-15' },
            machineryOwnership: { status: 'approved', verifiedAt: '2023-05-22' },
            farmlandAuthority: { status: 'under_review', submittedAt: '2026-10-18' }
          }
        },
        {
          id: 'user_2',
          name: 'Adesola Olawale',
          displayName: 'Engr. Adesola Olawale',
          email: 'adesola.olawale@greenroots.ng',
          phone: '+234 802 334 9911',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          badge: 'Master Agronomist 🌱',
          bio: 'Registered agricultural engineer and agroforestry estate developer managing 300+ hectares across Oyo and Ogun states.',
          location: {
            state: 'Oyo',
            lga: 'Iseyin',
            town: 'Iseyin Valley',
            country: 'Nigeria'
          },
          memberSince: 'January 2024',
          rating: 4.95,
          reviewCount: 44,
          completedBookingsCount: 61,
          responseRate: '100%',
          responseTime: '< 15 mins',
          verification: {
            identity: { status: 'approved', verifiedAt: '2024-01-12' },
            phone: { status: 'approved', verifiedAt: '2024-01-12' },
            email: { status: 'approved', verifiedAt: '2024-01-12' },
            farmlandAuthority: { status: 'approved', verifiedAt: '2024-02-01' }
          }
        },
        {
          id: 'user_3',
          name: 'Chidi Emeka Okonkwo',
          displayName: 'Chidi Okonkwo (Benue Agro-Labour)',
          email: 'chidi.okonkwo@agrolabour.ng',
          phone: '+234 814 772 1045',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
          badge: 'Vetted Labour Coordinator ⭐',
          bio: 'Leading agricultural labour contractor in Benue State with seasoned teams experienced in yam mounding, cassava planting, and grain harvesting.',
          location: {
            state: 'Benue',
            lga: 'Gboko',
            town: 'Gboko Central',
            country: 'Nigeria'
          },
          memberSince: 'August 2023',
          rating: 4.88,
          reviewCount: 29,
          completedBookingsCount: 37,
          responseRate: '95%',
          responseTime: '< 1 hour',
          verification: {
            identity: { status: 'approved', verifiedAt: '2023-08-20' },
            phone: { status: 'approved', verifiedAt: '2023-08-20' },
            email: { status: 'approved', verifiedAt: '2023-08-20' }
          }
        },
        {
          id: 'user_4',
          name: 'Fatima Zahra Bello',
          displayName: 'Dr. Fatima Bello',
          email: 'fatima.bello@hortitech.ng',
          phone: '+234 809 112 4499',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
          badge: 'Agronomy Trainer 🎓',
          bio: 'Horticulture specialist, greenhouse designer, and international trainer for commercial tomato, habanero, and bell pepper farming.',
          location: {
            state: 'Plateau',
            lga: 'Jos South',
            town: 'Bukuru',
            country: 'Nigeria'
          },
          memberSince: 'May 2024',
          rating: 5.0,
          reviewCount: 19,
          completedBookingsCount: 24,
          responseRate: '99%',
          responseTime: '< 20 mins',
          verification: {
            identity: { status: 'approved', verifiedAt: '2024-05-10' },
            phone: { status: 'approved', verifiedAt: '2024-05-10' },
            email: { status: 'approved', verifiedAt: '2024-05-10' },
            trainingCredential: { status: 'approved', verifiedAt: '2024-05-25' }
          }
        }
      ],
      listings: [
        {
          id: 'list_farmland_01',
          owner_id: 'user_2',
          provider_name: 'Engr. Adesola Olawale',
          category: 'farmland',
          title: '25 Hectares Prime Fertile Loam Farmland with River Irrigation',
          description: 'Sprawling, flat agricultural terrain with rich deep loam topsoil located in Iseyin along the Ogun River basin. Accessible year-round via graded truck road. Fully demarcated perimeter with verified Survey Plan and Certificate of Occupancy (C of O). Ideal for maize, cassava, soybeans, and all-season vegetable cultivation.',
          location: {
            state: 'Oyo',
            lga: 'Iseyin',
            town: 'Ogun River Corridor',
            address_privacy: 'general_area'
          },
          price: 180000,
          pricing_unit: 'hectare / year',
          status: 'active',
          verified: true,
          cover_image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
          gallery: [
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800'
          ],
          attributes: {
            size: 25,
            unit: 'hectares',
            soil_type: 'Deep Loam / High Organic Content',
            water_source: 'Perennial River & Borehole point',
            topography: 'Flat / Gentle Slope (1-2%)',
            access_road: 'All-season Graded Truck Access',
            lease_term: '1 to 5 Years Renewable',
            title_type: 'Certificate of Occupancy (C of O) Verified'
          },
          availability: {
            status: 'available_now',
            minimum_lease_years: 1,
            maximum_lease_years: 5
          },
          created_at: '2026-02-14T08:00:00Z',
          updated_at: '2026-10-25T14:30:00Z',
          views_count: 1420,
          search_impressions: 6850,
          enquiry_count: 34
        },
        {
          id: 'list_farmland_02',
          owner_id: 'user_1',
          provider_name: 'Musa Danladi',
          category: 'farmland',
          title: '50 Hectares High-Yield Grain-Ready Farmland in Zaria',
          description: 'Cleared and rock-free grain cultivation land ready for immediate tractor operations. High nitrogen clay loam composition optimal for sorghum, maize, cowpea, and groundnut rotations. Bordered by irrigation canal access.',
          location: {
            state: 'Kaduna',
            lga: 'Zaria',
            town: 'Dambo Agricultural Belt',
            address_privacy: 'general_area'
          },
          price: 140000,
          pricing_unit: 'hectare / year',
          status: 'active',
          verified: true,
          cover_image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800',
          gallery: [
            'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
          ],
          attributes: {
            size: 50,
            unit: 'hectares',
            soil_type: 'Clay Loam (Grain Optimized)',
            water_source: 'Seasonal Canal & Water Reservoir',
            topography: 'Level Plain',
            access_road: 'Tarred Highway 2km off-road',
            lease_term: '1 to 3 Years',
            title_type: 'Customary Right of Occupancy with Local Govt Gazette'
          },
          availability: {
            status: 'available_now',
            minimum_lease_years: 1,
            maximum_lease_years: 3
          },
          created_at: '2026-03-01T10:00:00Z',
          updated_at: '2026-10-28T09:15:00Z',
          views_count: 980,
          search_impressions: 4300,
          enquiry_count: 21
        },
        {
          id: 'list_machinery_01',
          owner_id: 'user_1',
          provider_name: 'Musa Danladi',
          category: 'machinery',
          title: 'Massey Ferguson 375 Tractor (75HP) with Disc Plough & Harrow',
          description: 'High-torque Massey Ferguson 375 4WD tractor in peak mechanical condition. Comes with heavy-duty 3-disc plough, 18-disc offset harrow, and certified operator with 8+ years experience. Low fuel consumption, reliable hydraulic system.',
          location: {
            state: 'Kaduna',
            lga: 'Zaria',
            town: 'Zaria Depot & North-West Service Radius',
            address_privacy: 'general_area'
          },
          price: 55000,
          pricing_unit: 'day',
          status: 'active',
          verified: true,
          cover_image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
          gallery: [
            'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&q=80&w=800'
          ],
          attributes: {
            machine_type: 'Tractor 4WD',
            make_model: 'Massey Ferguson 375 (75 HP)',
            condition: 'Excellent / Serviced Bi-weekly',
            operator_included: 'Yes (Certified Professional Included)',
            fuel_terms: 'Client provides Diesel (AGO) or Fuel-at-cost option',
            delivery_available: 'Yes, Flatbed low-loader within 80km radius',
            implements_included: '3-Disc Plough, 18-Disc Harrow, Ridger'
          },
          availability: {
            status: 'available_now',
            minimum_rental_days: 2,
            maximum_rental_days: 30
          },
          created_at: '2026-01-20T11:00:00Z',
          updated_at: '2026-11-01T16:00:00Z',
          views_count: 2150,
          search_impressions: 11200,
          enquiry_count: 58
        },
        {
          id: 'list_machinery_02',
          owner_id: 'user_2',
          provider_name: 'Engr. Adesola Olawale',
          category: 'machinery',
          title: 'John Deere S680 Combine Harvester (Grain & Rice Header)',
          description: 'Industrial capacity John Deere grain combine harvester with advanced loss-monitoring sensor technology. Includes 25-ft draper header and specialized paddy rice attachment. Capable of harvesting 15-20 hectares daily with minimal grain breakage.',
          location: {
            state: 'Ogun',
            lga: 'Abeokuta North',
            town: 'Abeokuta Industrial Hub',
            address_privacy: 'general_area'
          },
          price: 280000,
          pricing_unit: 'day',
          status: 'active',
          verified: true,
          cover_image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&q=80&w=800',
          gallery: [
            'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800'
          ],
          attributes: {
            machine_type: 'Combine Harvester',
            make_model: 'John Deere S680 (Rotary Separation)',
            condition: 'Certified Inspection Passed',
            operator_included: 'Yes (Senior Technician & Co-operator)',
            fuel_terms: 'Dry Lease / Client supplies AGO',
            delivery_available: 'Heavy Duty Flatbed Transport Arranged'
          },
          availability: {
            status: 'available_now',
            minimum_rental_days: 3,
            maximum_rental_days: 21
          },
          created_at: '2026-02-05T12:00:00Z',
          updated_at: '2026-10-30T10:00:00Z',
          views_count: 1890,
          search_impressions: 8900,
          enquiry_count: 42
        },
        {
          id: 'list_labour_01',
          owner_id: 'user_3',
          provider_name: 'Chidi Okonkwo (Benue Agro-Labour)',
          category: 'labour',
          title: 'Seasoned 10-Man Cassava & Yam Harvesting Crew',
          description: 'Disciplined, energetic 10-person agricultural crew specialized in root crop extraction, grading, and field bagging. Minimum root breakage guarantee with tools (harvesting forks, cutlasses, sacks) provided. High daily output.',
          location: {
            state: 'Benue',
            lga: 'Gboko',
            town: 'Gboko / Makurdi Belt',
            address_privacy: 'general_area'
          },
          price: 45000,
          pricing_unit: 'crew / day',
          status: 'active',
          verified: true,
          cover_image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800',
          gallery: [
            'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800'
          ],
          attributes: {
            crew_size: '10 Skilled Workers + 1 Supervisor',
            work_type: 'Cassava, Yam & Sweet Potato Harvesting / Bagging',
            experience_years: '7+ Years Group Experience',
            daily_hours: '8:00 AM – 4:30 PM (with 1 hr rest break)',
            tools_provided: 'Full Hand Tools, Machetes, Extraction Stakes',
            accommodation_required: 'Only for multi-day assignments over 50km'
          },
          availability: {
            status: 'available_now',
            minimum_booking_days: 2,
            maximum_booking_days: 14
          },
          created_at: '2026-03-10T14:00:00Z',
          updated_at: '2026-11-02T11:00:00Z',
          views_count: 1120,
          search_impressions: 5400,
          enquiry_count: 31
        },
        {
          id: 'list_training_01',
          owner_id: 'user_4',
          provider_name: 'Dr. Fatima Bello',
          category: 'training',
          title: 'Commercial Greenhouse Tomato & Habanero Masterclass',
          description: 'Intensive 5-day hands-on masterclass covering greenhouse climate control, drip fertigation formulation, biological pest management, and export grading standards. Includes printed operational manual and TerraTills Certificate of Competency.',
          location: {
            state: 'Plateau',
            lga: 'Jos South',
            town: 'Jos Greenhouse Center',
            address_privacy: 'exact'
          },
          price: 75000,
          pricing_unit: 'participant',
          status: 'active',
          verified: true,
          cover_image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
          gallery: [
            'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800'
          ],
          attributes: {
            course_level: 'Intermediate to Commercial Enterprise',
            delivery_mode: 'In-person Practical + Hybrid Digital Materials',
            duration_days: '5 Days (Full time)',
            certification: 'Accredited TerraTills Agro-Certificate',
            materials_included: 'Fertigation Guide, Seed Starter Kit, PPE',
            instructor_credentials: 'PhD Horticulture, 12 years Commercial Farm Manager'
          },
          availability: {
            status: 'enrolling_cohort',
            next_cohort_date: '2026-12-05',
            seat_capacity: 25
          },
          created_at: '2026-04-12T09:00:00Z',
          updated_at: '2026-11-01T18:00:00Z',
          views_count: 850,
          search_impressions: 4100,
          enquiry_count: 27
        }
      ],
      bookings: [
        {
          id: 'BK-2026-8801',
          reference: 'BK-2026-8801',
          customer_id: 'user_1',
          customer_name: 'Musa Danladi',
          provider_id: 'user_2',
          provider_name: 'Engr. Adesola Olawale',
          listing_id: 'list_farmland_01',
          listing_title: '25 Hectares Prime Fertile Loam Farmland with River Irrigation',
          category: 'farmland',
          listing_snapshot: {
            title: '25 Hectares Prime Fertile Loam Farmland with River Irrigation',
            category: 'farmland',
            unit_price: 180000,
            pricing_unit: 'hectare / year',
            location: 'Iseyin, Oyo State',
            agreed_hectares: 10,
            lease_duration_years: 1
          },
          scheduled_dates: {
            start: '2026-12-01',
            end: '2027-11-30'
          },
          service_location: {
            state: 'Oyo',
            lga: 'Iseyin',
            town: 'Ogun River Corridor',
            details: 'Plot Section B, demarcated with survey beacons'
          },
          amount_breakdown: {
            base_amount: 1800000, // 10 hectares @ 180,000
            survey_legal_fee: 100000,
            platform_fee: 95000,
            total_amount: 1995000
          },
          terms_agreed: {
            provider_accepted_at: '2026-11-02T10:14:00Z',
            agreed_scope: '10 hectares lease for hybrid maize grain production',
            cancellation_policy: 'Full refund if cancelled before possession; 50% survey deduction thereafter.',
            payment_due_date: '2026-11-15'
          },
          status: BOOKING_STATES.AWAITING_PAYMENT,
          payment_status: PAYMENT_STATES.PENDING,
          settlement_status: SETTLEMENT_STATES.NOT_ELIGIBLE,
          created_at: '2026-11-01T08:30:00Z',
          updated_at: '2026-11-02T10:14:00Z',
          timeline: [
            { step: 'request_submitted', actor: 'customer', timestamp: '2026-11-01T08:30:00Z', note: 'Booking request sent by Musa Danladi for 10 hectares' },
            { step: 'provider_accepted', actor: 'provider', timestamp: '2026-11-02T10:14:00Z', note: 'Provider accepted terms. Scope & price finalized. Customer can proceed to review & payment.' }
          ]
        },
        {
          id: 'BK-2026-8802',
          reference: 'BK-2026-8802',
          customer_id: 'user_2',
          customer_name: 'Engr. Adesola Olawale',
          provider_id: 'user_1',
          provider_name: 'Musa Danladi',
          listing_id: 'list_machinery_01',
          listing_title: 'Massey Ferguson 375 Tractor (75HP) with Disc Plough & Harrow',
          category: 'machinery',
          listing_snapshot: {
            title: 'Massey Ferguson 375 Tractor (75HP) with Disc Plough & Harrow',
            category: 'machinery',
            unit_price: 55000,
            pricing_unit: 'day',
            days_count: 5,
            operator_included: true
          },
          scheduled_dates: {
            start: '2026-11-10',
            end: '2026-11-15'
          },
          service_location: {
            state: 'Kaduna',
            lga: 'Zaria',
            town: 'Dambo Farmlands',
            details: 'Field Gate 3 off Zaria-Kano expressway'
          },
          amount_breakdown: {
            base_amount: 275000, // 5 days @ 55,000
            operator_allowance: 25000,
            logistics_delivery: 40000,
            total_amount: 340000
          },
          payment_details: {
            provider: 'bach',
            gateway_reference: 'BACH-TX-99812481-OK',
            transaction_reference: 'TX-2026-0091',
            paid_at: '2026-11-03T14:20:00Z',
            method: 'Bank Transfer (NIP Virtual Account)',
            amount_paid: 340000
          },
          status: BOOKING_STATES.IN_PROGRESS,
          payment_status: PAYMENT_STATES.SUCCESSFUL,
          settlement_status: SETTLEMENT_STATES.NOT_ELIGIBLE,
          created_at: '2026-11-02T11:00:00Z',
          updated_at: '2026-11-03T14:25:00Z',
          timeline: [
            { step: 'request_submitted', actor: 'customer', timestamp: '2026-11-02T11:00:00Z', note: 'Customer requested 5 days tractor harrowing' },
            { step: 'provider_accepted', actor: 'provider', timestamp: '2026-11-02T15:30:00Z', note: 'Terms agreed with operator deployment confirmed' },
            { step: 'payment_verified', actor: 'system_bach', timestamp: '2026-11-03T14:20:00Z', note: 'Server verified Bach payment of ₦340,000. Funds secured in platform holding.' },
            { step: 'in_progress', actor: 'provider', timestamp: '2026-11-04T07:00:00Z', note: 'Machinery mobilized to site.' }
          ]
        },
        {
          id: 'BK-2026-8803',
          reference: 'BK-2026-8803',
          customer_id: 'user_1',
          customer_name: 'Musa Danladi',
          provider_id: 'user_3',
          provider_name: 'Chidi Okonkwo (Benue Agro-Labour)',
          listing_id: 'list_labour_01',
          listing_title: 'Seasoned 10-Man Cassava & Yam Harvesting Crew',
          category: 'labour',
          listing_snapshot: {
            title: 'Seasoned 10-Man Cassava & Yam Harvesting Crew',
            category: 'labour',
            unit_price: 45000,
            pricing_unit: 'crew / day',
            days_count: 4
          },
          scheduled_dates: {
            start: '2026-10-24',
            end: '2026-10-28'
          },
          service_location: {
            state: 'Benue',
            lga: 'Gboko',
            town: 'Tiv Yam Farm Zone'
          },
          amount_breakdown: {
            base_amount: 180000,
            crew_transport: 20000,
            total_amount: 200000
          },
          payment_details: {
            provider: 'bach',
            gateway_reference: 'BACH-TX-77192844-OK',
            transaction_reference: 'TX-2026-0044',
            paid_at: '2026-10-22T09:10:00Z',
            method: 'Debit Card (Mastercard)',
            amount_paid: 200000
          },
          provider_confirmed_at: '2026-10-28T17:30:00Z',
          provider_completion_note: 'Harvest completed on all 4 hectares. 380 sacks of cassava tubers extracted and assembled at roadside loading bay.',
          customer_confirmed_at: null, // Ready for customer completion confirmation!
          status: BOOKING_STATES.AWAITING_COMPLETION_CONFIRMATION,
          payment_status: PAYMENT_STATES.SUCCESSFUL,
          settlement_status: SETTLEMENT_STATES.AWAITING_COMPLETION_CONFIRMATION,
          created_at: '2026-10-20T10:00:00Z',
          updated_at: '2026-10-28T17:30:00Z',
          timeline: [
            { step: 'request_submitted', actor: 'customer', timestamp: '2026-10-20T10:00:00Z', note: 'Booking request created' },
            { step: 'terms_agreed', actor: 'provider', timestamp: '2026-10-21T12:00:00Z', note: 'Agreed on 10-man team for 4 days' },
            { step: 'payment_verified', actor: 'system_bach', timestamp: '2026-10-22T09:10:00Z', note: 'Payment verified and held in platform custody' },
            { step: 'work_completed_by_provider', actor: 'provider', timestamp: '2026-10-28T17:30:00Z', note: 'Provider recorded delivery completion. Awaiting independent customer confirmation.' }
          ]
        },
        {
          id: 'BK-2026-8804',
          reference: 'BK-2026-8804',
          customer_id: 'user_1',
          customer_name: 'Musa Danladi',
          provider_id: 'user_4',
          provider_name: 'Dr. Fatima Bello',
          listing_id: 'list_training_01',
          listing_title: 'Commercial Greenhouse Tomato & Habanero Masterclass',
          category: 'training',
          listing_snapshot: {
            title: 'Commercial Greenhouse Tomato & Habanero Masterclass',
            category: 'training',
            unit_price: 75000,
            pricing_unit: 'participant',
            participants_count: 2
          },
          scheduled_dates: {
            start: '2026-10-05',
            end: '2026-10-09'
          },
          service_location: {
            state: 'Plateau',
            lga: 'Jos South',
            town: 'Jos Greenhouse Center'
          },
          amount_breakdown: {
            base_amount: 150000, // 2 participants
            materials_fee: 15000,
            total_amount: 165000
          },
          payment_details: {
            provider: 'bach',
            gateway_reference: 'BACH-TX-66281920-OK',
            transaction_reference: 'TX-2026-0012',
            paid_at: '2026-10-01T11:00:00Z',
            method: 'Bank Transfer (Bach NIP)',
            amount_paid: 165000
          },
          provider_confirmed_at: '2026-10-09T16:00:00Z',
          customer_confirmed_at: '2026-10-09T18:00:00Z',
          status: BOOKING_STATES.COMPLETED,
          payment_status: PAYMENT_STATES.SUCCESSFUL,
          settlement_status: SETTLEMENT_STATES.PAID,
          created_at: '2026-09-28T09:00:00Z',
          updated_at: '2026-10-10T12:00:00Z',
          timeline: [
            { step: 'request_submitted', actor: 'customer', timestamp: '2026-09-28T09:00:00Z', note: 'Registered 2 delegates for Greenhouse training' },
            { step: 'payment_verified', actor: 'system_bach', timestamp: '2026-10-01T11:00:00Z', note: 'Payment verified' },
            { step: 'training_completed', actor: 'provider', timestamp: '2026-10-09T16:00:00Z', note: 'Training delivered and certificates issued' },
            { step: 'customer_confirmed', actor: 'customer', timestamp: '2026-10-09T18:00:00Z', note: 'Customer independently confirmed satisfactory completion' },
            { step: 'settlement_disbursed', actor: 'system', timestamp: '2026-10-10T12:00:00Z', note: 'Net earnings paid to provider verified payout bank account' }
          ]
        }
      ],
      service_requests: [
        {
          id: 'req_001',
          reference: 'REQ-2026-0419',
          listing_id: 'list_machinery_01',
          listing_title: 'Massey Ferguson 375 Tractor (75HP) with Disc Plough & Harrow',
          customer_id: 'user_3',
          customer_name: 'Chidi Emeka Okonkwo',
          customer_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
          provider_id: 'user_1',
          requested_dates: {
            start: '2026-11-20',
            duration_days: 3
          },
          service_location: {
            state: 'Kaduna',
            lga: 'Igabi',
            town: 'Rigasa Agro Cluster'
          },
          proposed_scope: '3 days ploughing and harrowing for early dry-season vegetable plots (approx 6 hectares). Operator needed.',
          proposed_amount: 165000,
          status: 'pending_provider_response',
          created_at: '2026-11-06T15:45:00Z'
        }
      ],
      transactions: [
        {
          id: 'TX-2026-0091',
          gateway_reference: 'BACH-TX-99812481-OK',
          booking_reference: 'BK-2026-8802',
          type: 'customer_payment',
          direction: 'inflow',
          user_id: 'user_2',
          amount: 340000,
          currency: 'NGN',
          status: 'successful',
          verification_state: 'verified_server_side',
          provider: 'bach',
          channel: 'Bank Transfer (NIP Virtual Account)',
          fees: 3400,
          created_at: '2026-11-03T14:20:00Z'
        },
        {
          id: 'TX-2026-0044',
          gateway_reference: 'BACH-TX-77192844-OK',
          booking_reference: 'BK-2026-8803',
          type: 'customer_payment',
          direction: 'inflow',
          user_id: 'user_1',
          amount: 200000,
          currency: 'NGN',
          status: 'successful',
          verification_state: 'verified_server_side',
          provider: 'bach',
          channel: 'Mastercard Debit',
          fees: 2500,
          created_at: '2026-10-22T09:10:00Z'
        },
        {
          id: 'TX-2026-0012',
          gateway_reference: 'BACH-TX-66281920-OK',
          booking_reference: 'BK-2026-8804',
          type: 'customer_payment',
          direction: 'inflow',
          user_id: 'user_1',
          amount: 165000,
          currency: 'NGN',
          status: 'successful',
          verification_state: 'verified_server_side',
          provider: 'bach',
          channel: 'Bach Instant Transfer',
          fees: 2000,
          created_at: '2026-10-01T11:00:00Z'
        }
      ],
      earnings: [
        {
          id: 'earn_01',
          provider_id: 'user_1',
          booking_id: 'BK-2026-8802',
          listing_title: 'Massey Ferguson 375 Tractor (75HP)',
          gross_amount: 340000,
          commission: 17000, // 5% platform fee
          deductions: 0,
          net_earnings: 323000,
          status: 'pending_completion', // Booking is still in progress
          eligible_for_payout: false,
          created_at: '2026-11-03T14:25:00Z'
        },
        {
          id: 'earn_02',
          provider_id: 'user_4',
          booking_id: 'BK-2026-8804',
          listing_title: 'Commercial Greenhouse Masterclass',
          gross_amount: 165000,
          commission: 8250,
          deductions: 0,
          net_earnings: 156750,
          status: 'paid',
          eligible_for_payout: true,
          payout_id: 'PO-2026-001',
          created_at: '2026-10-09T18:00:00Z'
        }
      ],
      payouts: [
        {
          id: 'PO-2026-001',
          provider_id: 'user_4',
          reference: 'PO-2026-001',
          amount: 156750,
          currency: 'NGN',
          destination_bank: 'Access Bank Nigeria PLC',
          destination_account: '******9102',
          status: 'completed',
          initiated_at: '2026-10-10T10:00:00Z',
          completed_at: '2026-10-10T12:00:00Z',
          bach_transfer_reference: 'BACH-TRF-881928-OK'
        }
      ],
      payment_methods: [
        {
          id: 'pm_card_01',
          user_id: 'user_1',
          type: 'customer_payment_method',
          kind: 'card',
          brand: 'Mastercard',
          last4: '4821',
          expiry: '08/28',
          bank_name: 'Guaranty Trust Bank',
          is_default: true,
          created_at: '2024-03-12'
        },
        {
          id: 'pm_payout_01',
          user_id: 'user_1',
          type: 'provider_payout_account',
          kind: 'bank_account',
          bank_name: 'Zenith Bank PLC',
          bank_code: '057',
          account_number_masked: '******5190',
          account_name: 'MUSA DANLADI AGRO ENT',
          verification_status: 'verified',
          is_default: true,
          created_at: '2024-03-20'
        }
      ],
      reviews: [
        {
          id: 'rev_01',
          booking_id: 'BK-2026-8804',
          reviewer_id: 'user_1',
          reviewer_name: 'Musa Danladi',
          reviewer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          reviewee_id: 'user_4',
          listing_id: 'list_training_01',
          rating: 5,
          category_ratings: {
            quality: 5,
            communication: 5,
            timeliness: 5,
            reliability: 5
          },
          comment: 'Outstanding practical training! Dr. Fatima shared exact fertigation recipes and greenhouse layout blueprints that have completely upgraded our farm productivity.',
          created_at: '2026-10-10T14:00:00Z',
          provider_response: 'Thank you Alhaji Musa! Delighted to see your agro-venture expanding into controlled climate production.'
        }
      ],
      saved_listings: [
        {
          user_id: 'user_1',
          listing_id: 'list_farmland_01',
          saved_at: '2026-10-15T09:00:00Z'
        },
        {
          user_id: 'user_1',
          listing_id: 'list_machinery_02',
          saved_at: '2026-10-20T11:30:00Z'
        }
      ],
      conversations: [
        {
          id: 'conv_01',
          booking_id: 'BK-2026-8801',
          participants: ['user_1', 'user_2'],
          listing_id: 'list_farmland_01',
          listing_title: '25 Hectares Prime Fertile Loam Farmland',
          last_message: 'Survey beacon inspection scheduled for Tuesday morning.',
          last_message_at: '2026-11-02T10:15:00Z',
          unread_count: { user_1: 0, user_2: 1 }
        },
        {
          id: 'conv_02',
          booking_id: 'BK-2026-8802',
          participants: ['user_1', 'user_2'],
          listing_id: 'list_machinery_01',
          listing_title: 'Massey Ferguson 375 Tractor',
          last_message: 'Operator Malam Ibrahim has arrived with the plough implement.',
          last_message_at: '2026-11-04T07:15:00Z',
          unread_count: { user_1: 0, user_2: 0 }
        }
      ],
      messages: [
        {
          id: 'msg_01',
          conversation_id: 'conv_01',
          sender_id: 'user_1',
          text: 'Good day Engr. Adesola. We would like to confirm if the river pump station is operational for dry season planting.',
          timestamp: '2026-11-01T09:00:00Z',
          read: true
        },
        {
          id: 'msg_02',
          conversation_id: 'conv_01',
          sender_id: 'user_2',
          text: 'Good day Alhaji Musa. Yes, the Ogun river pump station operates with dual 15HP submersible pumps. Survey beacon inspection scheduled for Tuesday morning.',
          timestamp: '2026-11-02T10:15:00Z',
          read: true
        }
      ],
      notifications: [
        {
          id: 'notif_01',
          user_id: 'user_1',
          type: 'service_request',
          title: 'New Service Request Received',
          summary: 'Chidi Okonkwo submitted a request for Massey Ferguson 375 Tractor (3 days).',
          related_record: { type: 'service_request', id: 'req_001' },
          destination: '/dashboard/service-requests/req_001',
          read: false,
          created_at: '2026-11-06T15:45:00Z'
        },
        {
          id: 'notif_02',
          user_id: 'user_1',
          type: 'booking',
          title: 'Terms Accepted — Payment Due',
          summary: 'Engr. Adesola accepted your booking terms for Farmland in Iseyin. Review & proceed to payment.',
          related_record: { type: 'booking', id: 'BK-2026-8801' },
          destination: '/dashboard/bookings/BK-2026-8801',
          read: false,
          created_at: '2026-11-02T10:14:00Z'
        },
        {
          id: 'notif_03',
          user_id: 'user_1',
          type: 'booking_completion',
          title: 'Provider Marked Service Completed',
          summary: 'Chidi Okonkwo reported harvesting complete on Benue cassava farm. Please inspect and confirm.',
          related_record: { type: 'booking', id: 'BK-2026-8803' },
          destination: '/dashboard/bookings/BK-2026-8803/completion',
          read: false,
          created_at: '2026-10-28T17:35:00Z'
        },
        {
          id: 'notif_04',
          user_id: 'user_1',
          type: 'payment',
          title: 'Payment Secured via Bach',
          summary: '₦340,000 received for Tractor Rental BK-2026-8802 and held in secured platform holding.',
          related_record: { type: 'transaction', id: 'TX-2026-0091' },
          destination: '/dashboard/finance/transactions/TX-2026-0091',
          read: true,
          created_at: '2026-11-03T14:22:00Z'
        }
      ],
      support_tickets: [
        {
          id: 'TCK-2026-901',
          user_id: 'user_1',
          reference: 'TCK-2026-901',
          category: 'verification',
          subject: 'Farmland Lease Authority Verification Query',
          description: 'Uploaded customary gazette for Zaria farmland parcel. Requesting update on verification timeline.',
          status: 'in_progress',
          created_at: '2026-10-20T14:00:00Z',
          messages: [
            {
              sender: 'user',
              text: 'Uploaded customary gazette for Zaria farmland parcel. Requesting update on verification timeline.',
              timestamp: '2026-10-20T14:00:00Z'
            },
            {
              sender: 'support',
              text: 'Hello Alhaji Musa, our verification team is cross-referencing the gazette with Kaduna State Lands Bureau. Verification will conclude within 24 working hours.',
              timestamp: '2026-10-21T09:30:00Z'
            }
          ]
        }
      ],
      verification_submissions: [
        {
          id: 'ver_01',
          user_id: 'user_1',
          type: 'farmland_authority',
          type_title: 'Farmland Ownership & Lease Authority Verification',
          status: 'under_review',
          submitted_at: '2026-10-18T11:00:00Z',
          documents: [
            { name: 'Kaduna_State_Customary_Gazette_Dambo.pdf', size: '2.4 MB', uploadDate: '2026-10-18' }
          ],
          declaration_accepted: true,
          notes: 'Document under inspection by land registry desk.'
        },
        {
          id: 'ver_02',
          user_id: 'user_1',
          type: 'machinery_ownership',
          type_title: 'Machinery Ownership & Operator Certification',
          status: 'approved',
          submitted_at: '2023-05-20T10:00:00Z',
          reviewed_at: '2023-05-22T15:00:00Z',
          documents: [
            { name: 'Massey_Ferguson_375_Receipt_ChassisDoc.pdf', size: '1.8 MB' }
          ]
        }
      ],
      user_locations: [
        {
          id: 'loc_01',
          user_id: 'user_1',
          label: 'Zaria Machinery Depot',
          type: 'machinery',
          state: 'Kaduna',
          lga: 'Zaria',
          town: 'Zaria City Industrial Layout',
          is_default: true
        },
        {
          id: 'loc_02',
          user_id: 'user_1',
          label: 'Dambo Grain Farmland',
          type: 'farmland',
          state: 'Kaduna',
          lga: 'Zaria',
          town: 'Dambo Agricultural Corridor',
          is_default: false
        }
      ],
      user_settings: {
        user_1: {
          notifications: {
            booking_updates: { in_app: true, email: true, sms: true },
            service_requests: { in_app: true, email: true, sms: true },
            payments: { in_app: true, email: true, sms: true },
            messages: { in_app: true, email: false, sms: false },
            marketing: { in_app: false, email: false, sms: false }
          },
          privacy: {
            profile_visibility: 'public',
            show_phone_number: 'confirmed_bookings_only',
            show_location_precision: 'general_community',
            allow_search_indexing: true
          },
          preferences: {
            language: 'English (Nigeria)',
            currency: 'NGN (₦)',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '12-hour (am/pm)',
            reduceMotion: false
          }
        }
      },
      audit_logs: [
        {
          id: 'log_01',
          actor_id: 'user_1',
          action: 'booking_request_created',
          target_type: 'booking',
          target_id: 'BK-2026-8801',
          timestamp: '2026-11-01T08:30:00Z',
          details: 'Created request for 10 hectares Farmland leasing in Oyo'
        },
        {
          id: 'log_02',
          actor_id: 'user_2',
          action: 'booking_request_accepted',
          target_type: 'booking',
          target_id: 'BK-2026-8801',
          timestamp: '2026-11-02T10:14:00Z',
          details: 'Agreed on scope and terms. Updated status to awaiting_payment.'
        }
      ]
    };
  }

  // Helper Accessors
  getUser(userId) {
    return this.data.users.find(u => u.id === userId);
  }

  getUserByEmailOrPhone(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(u => 
      (u.email && u.email.toLowerCase() === clean) ||
      (u.phone && u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    );
  }

  createUser(userData) {
    const id = `user_${Date.now()}`;
    const newUser = {
      id,
      name: userData.name,
      displayName: userData.displayName || userData.name.split(' ')[0],
      email: userData.email,
      phone: userData.phone,
      password: userData.password || 'password123',
      role: 'user', // Non-negotiable: Unified account
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      badge: 'Registered Agro Member 🌿',
      bio: userData.bio || 'Verified participant in Nigeria agricultural services marketplace.',
      location: userData.location || { state: 'Kaduna', lga: 'Zaria', town: 'Zaria', country: 'Nigeria' },
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      rating: 5.0,
      reviewCount: 0,
      completedBookingsCount: 0,
      responseRate: '100%',
      responseTime: '< 1 hr',
      verification: {
        identity: { status: 'pending', submittedAt: new Date().toISOString() },
        phone: { status: 'approved', verifiedAt: new Date().toISOString() },
        email: { status: 'approved', verifiedAt: new Date().toISOString() },
        machineryOwnership: { status: 'unverified' },
        farmlandAuthority: { status: 'unverified' }
      }
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUserPassword(userId, newPassword) {
    const user = this.getUser(userId);
    if (user) {
      user.password = newPassword;
      this.save();
      return true;
    }
    return false;
  }

  getUsers() {
    return this.data.users;
  }

  getListings(filter = {}) {
    let results = [...this.data.listings];
    if (filter.category) {
      results = results.filter(l => l.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.owner_id) {
      results = results.filter(l => l.owner_id === filter.owner_id);
    }
    if (filter.status) {
      results = results.filter(l => l.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q) ||
        l.location.state.toLowerCase().includes(q) ||
        l.location.lga.toLowerCase().includes(q) ||
        l.location.town.toLowerCase().includes(q)
      );
    }
    if (filter.state) {
      results = results.filter(l => l.location.state.toLowerCase() === filter.state.toLowerCase());
    }
    if (filter.min_price) {
      results = results.filter(l => l.price >= Number(filter.min_price));
    }
    if (filter.max_price) {
      results = results.filter(l => l.price <= Number(filter.max_price));
    }
    if (filter.verified !== undefined) {
      results = results.filter(l => l.verified === (filter.verified === 'true' || filter.verified === true));
    }
    return results;
  }

  getListing(id) {
    return this.data.listings.find(l => l.id === id);
  }

  addListing(listing) {
    listing.id = listing.id || `list_${Date.now()}`;
    listing.created_at = new Date().toISOString();
    listing.updated_at = new Date().toISOString();
    listing.views_count = 0;
    listing.search_impressions = 0;
    listing.enquiry_count = 0;
    this.data.listings.unshift(listing);
    this.save();
    return listing;
  }

  updateListing(id, updates) {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.listings[idx] = {
      ...this.data.listings[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.listings[idx];
  }

  getBookings(userId, roleFilter = null) {
    // Return all bookings where user is either customer or provider
    return this.data.bookings.filter(b => {
      if (roleFilter === 'customer') return b.customer_id === userId;
      if (roleFilter === 'provider') return b.provider_id === userId;
      return b.customer_id === userId || b.provider_id === userId;
    });
  }

  getBooking(bookingId) {
    return this.data.bookings.find(b => b.id === bookingId || b.reference === bookingId);
  }

  createBooking(booking) {
    booking.id = booking.id || `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    booking.reference = booking.id;
    booking.created_at = new Date().toISOString();
    booking.updated_at = new Date().toISOString();
    this.data.bookings.unshift(booking);
    this.save();
    return booking;
  }

  updateBooking(id, updates) {
    const idx = this.data.bookings.findIndex(b => b.id === id || b.reference === id);
    if (idx === -1) return null;
    this.data.bookings[idx] = {
      ...this.data.bookings[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.bookings[idx];
  }

  getServiceRequests(userId) {
    return this.data.service_requests.filter(r => r.provider_id === userId);
  }

  getServiceRequest(id) {
    return this.data.service_requests.find(r => r.id === id || r.reference === id);
  }

  createServiceRequest(req) {
    req.id = req.id || `req_${Date.now()}`;
    req.reference = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    req.created_at = new Date().toISOString();
    this.data.service_requests.unshift(req);
    this.save();
    return req;
  }

  updateServiceRequest(id, updates) {
    const idx = this.data.service_requests.findIndex(r => r.id === id || r.reference === id);
    if (idx === -1) return null;
    this.data.service_requests[idx] = {
      ...this.data.service_requests[idx],
      ...updates
    };
    this.save();
    return this.data.service_requests[idx];
  }

  getTransactions(userId) {
    // Both customer payments and provider earnings payouts
    return this.data.transactions.filter(t => t.user_id === userId);
  }

  getTransaction(id) {
    return this.data.transactions.find(t => t.id === id || t.gateway_reference === id);
  }

  addTransaction(tx) {
    tx.id = tx.id || `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    tx.created_at = new Date().toISOString();
    this.data.transactions.unshift(tx);
    this.save();
    return tx;
  }

  getEarnings(userId) {
    return this.data.earnings.filter(e => e.provider_id === userId);
  }

  getPayouts(userId) {
    return this.data.payouts.filter(p => p.provider_id === userId);
  }

  addPayout(po) {
    po.id = po.id || `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    po.reference = po.id;
    po.initiated_at = new Date().toISOString();
    this.data.payouts.unshift(po);
    this.save();
    return po;
  }

  getPaymentMethods(userId) {
    return this.data.payment_methods.filter(pm => pm.user_id === userId);
  }

  addPaymentMethod(pm) {
    pm.id = pm.id || `pm_${Date.now()}`;
    pm.created_at = new Date().toISOString();
    this.data.payment_methods.push(pm);
    this.save();
    return pm;
  }

  removePaymentMethod(id, userId) {
    this.data.payment_methods = this.data.payment_methods.filter(pm => !(pm.id === id && pm.user_id === userId));
    this.save();
  }

  getReviews(userId) {
    const received = this.data.reviews.filter(r => r.reviewee_id === userId);
    const given = this.data.reviews.filter(r => r.reviewer_id === userId);
    
    // Bookings completed by user without a review yet:
    const completedBookings = this.data.bookings.filter(b => 
      (b.customer_id === userId || b.provider_id === userId) && 
      b.status === BOOKING_STATES.COMPLETED
    );
    const reviewedBookingIds = new Set(this.data.reviews.map(r => r.booking_id));
    const awaiting = completedBookings.filter(b => !reviewedBookingIds.has(b.id));

    return { received, given, awaiting };
  }

  addReview(review) {
    review.id = review.id || `rev_${Date.now()}`;
    review.created_at = new Date().toISOString();
    this.data.reviews.unshift(review);
    this.save();
    return review;
  }

  getSavedListings(userId) {
    const saved = this.data.saved_listings.filter(s => s.user_id === userId);
    const listingIds = new Set(saved.map(s => s.listing_id));
    return this.data.listings.filter(l => listingIds.has(l.id));
  }

  toggleSaveListing(userId, listingId) {
    const idx = this.data.saved_listings.findIndex(s => s.user_id === userId && s.listing_id === listingId);
    if (idx !== -1) {
      this.data.saved_listings.splice(idx, 1);
      this.save();
      return { saved: false };
    } else {
      this.data.saved_listings.push({ user_id: userId, listing_id: listingId, saved_at: new Date().toISOString() });
      this.save();
      return { saved: true };
    }
  }

  getNotifications(userId) {
    return this.data.notifications.filter(n => n.user_id === userId);
  }

  markNotificationRead(id, userId) {
    const notif = this.data.notifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.read = true;
      this.save();
    }
    return notif;
  }

  markAllNotificationsRead(userId) {
    this.data.notifications.forEach(n => {
      if (n.user_id === userId) n.read = true;
    });
    this.save();
  }

  getConversations(userId) {
    return this.data.conversations.filter(c => c.participants.includes(userId));
  }

  getConversation(id, userId) {
    const conv = this.data.conversations.find(c => c.id === id);
    if (!conv || !conv.participants.includes(userId)) return null;
    const msgs = this.data.messages.filter(m => m.conversation_id === id);
    return { ...conv, messages: msgs };
  }

  addMessage(conversationId, senderId, text, attachments = []) {
    const msg = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      text,
      attachments,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.data.messages.push(msg);

    const conv = this.data.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.last_message = text;
      conv.last_message_at = msg.timestamp;
      // Increment unread for the other participant
      conv.participants.forEach(p => {
        if (p !== senderId) {
          conv.unread_count[p] = (conv.unread_count[p] || 0) + 1;
        }
      });
    }
    this.save();
    return msg;
  }

  getSupportTickets(userId) {
    return this.data.support_tickets.filter(t => t.user_id === userId);
  }

  getSupportTicket(id, userId) {
    return this.data.support_tickets.find(t => (t.id === id || t.reference === id) && t.user_id === userId);
  }

  createSupportTicket(ticket) {
    ticket.id = `TCK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    ticket.reference = ticket.id;
    ticket.status = 'open';
    ticket.created_at = new Date().toISOString();
    ticket.messages = [
      {
        sender: 'user',
        text: ticket.description,
        timestamp: ticket.created_at
      }
    ];
    this.data.support_tickets.unshift(ticket);
    this.save();
    return ticket;
  }

  addSupportMessage(ticketId, userId, text) {
    const ticket = this.getSupportTicket(ticketId, userId);
    if (!ticket) return null;
    ticket.messages.push({
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    });
    this.save();
    return ticket;
  }

  getVerificationSubmissions(userId) {
    return this.data.verification_submissions.filter(v => v.user_id === userId);
  }

  submitVerification(sub) {
    sub.id = `ver_${Date.now()}`;
    sub.status = 'under_review';
    sub.submitted_at = new Date().toISOString();
    this.data.verification_submissions.unshift(sub);
    this.save();
    return sub;
  }

  getUserLocations(userId) {
    return this.data.user_locations.filter(l => l.user_id === userId);
  }

  addUserLocation(loc) {
    loc.id = `loc_${Date.now()}`;
    this.data.user_locations.push(loc);
    this.save();
    return loc;
  }

  deleteUserLocation(id, userId) {
    this.data.user_locations = this.data.user_locations.filter(l => !(l.id === id && l.user_id === userId));
    this.save();
  }

  getUserSettings(userId) {
    return this.data.user_settings[userId] || {
      notifications: {
        booking_updates: { in_app: true, email: true, sms: true },
        service_requests: { in_app: true, email: true, sms: true },
        payments: { in_app: true, email: true, sms: true }
      },
      privacy: { profile_visibility: 'public' },
      preferences: { language: 'English (Nigeria)', currency: 'NGN (₦)' }
    };
  }

  updateUserSettings(userId, updates) {
    this.data.user_settings[userId] = {
      ...this.getUserSettings(userId),
      ...updates
    };
    this.save();
    return this.data.user_settings[userId];
  }

  addAuditLog(actorId, action, targetType, targetId, details) {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      timestamp: new Date().toISOString(),
      details
    };
    this.data.audit_logs.unshift(log);
    this.save();
    return log;
  }
}

export const db = new Database();

