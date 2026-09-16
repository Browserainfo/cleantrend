import React from 'react';

interface GarmentIconProps {
  icon: string;
  className?: string;
}

export const GarmentIcon: React.FC<GarmentIconProps> = ({ icon, className = 'w-10 h-10' }) => {
  switch (icon) {
    case 'tshirt':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 16L6 24L12 32L18 28V52H46V28L52 32L58 24L46 16C42 20 36 22 32 22C28 22 22 20 18 16Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M24 16C26 19 29 21 32 21C35 21 38 19 40 16" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    case 'jeans':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M16 12H48V20L44 54H33L32 28L31 54H20L16 20V12Z" fill="#2563EB" stroke="#1E40AF" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M20 20H44" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
          <path d="M32 12V24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 24C23 24 25 21 25 18M44 24C41 24 39 21 39 18" stroke="#93C5FD" strokeWidth="1.5"/>
        </svg>
      );
    case 'pants':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M17 12H47L44 54H33.5L32 26L30.5 54H20L17 12Z" fill="#D97706" stroke="#92400E" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M17 17H47" stroke="#FDE68A" strokeWidth="2"/>
          <path d="M32 12V20" stroke="#FDE68A" strokeWidth="2"/>
          <line x1="24" y1="26" x2="23" y2="52" stroke="#B45309" strokeWidth="1.5" strokeDasharray="2 2"/>
          <line x1="40" y1="26" x2="41" y2="52" stroke="#B45309" strokeWidth="1.5" strokeDasharray="2 2"/>
        </svg>
      );
    case 'shirt':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 14L6 22L12 30L18 26V52H46V26L52 30L58 22L46 14L38 18L32 14L26 18L18 14Z" fill="#E2E8F0" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M26 14L32 22L38 14" stroke="#475569" strokeWidth="2" strokeLinejoin="round"/>
          <line x1="32" y1="22" x2="32" y2="52" stroke="#475569" strokeWidth="2"/>
          <circle cx="32" cy="28" r="1.5" fill="#334155"/>
          <circle cx="32" cy="36" r="1.5" fill="#334155"/>
          <circle cx="32" cy="44" r="1.5" fill="#334155"/>
          <path d="M22 26H28V32H22Z" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5"/>
        </svg>
      );
    case 'coat':
    case 'blazer':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M16 14L6 22L12 32L18 28V52H46V28L52 32L58 22L46 14L32 22L16 14Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M24 14L32 34L40 14" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M30 18L32 21L34 18L33 28L31 28Z" fill="#E11D48"/>
          <path d="M22 36L32 36" stroke="#0F172A" strokeWidth="2"/>
          <circle cx="32" cy="40" r="1.5" fill="#94A3B8"/>
          <circle cx="32" cy="46" r="1.5" fill="#94A3B8"/>
        </svg>
      );
    case 'jacket_half':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M20 14H44L48 24V52H16V24L20 14Z" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M32 14V52" stroke="#FFF7ED" strokeWidth="2.5"/>
          <line x1="16" y1="24" x2="48" y2="24" stroke="#9A3412" strokeWidth="1.5"/>
          <line x1="16" y1="34" x2="48" y2="34" stroke="#9A3412" strokeWidth="1.5"/>
          <line x1="16" y1="44" x2="48" y2="44" stroke="#9A3412" strokeWidth="1.5"/>
        </svg>
      );
    case 'jacket':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 14L6 24L12 34L18 28V52H46V28L52 34L58 24L46 14H18Z" fill="#0D9488" stroke="#115E59" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M32 14V52" stroke="#CCFBF1" strokeWidth="2.5"/>
          <path d="M24 14C24 18 28 20 32 20C36 20 40 18 40 14" stroke="#115E59" strokeWidth="2"/>
          <circle cx="32" cy="26" r="2" fill="#F0FDFA"/>
        </svg>
      );
    case 'suit2':
    case 'suit3':
    case 'tuxedo':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M16 12L6 20L11 30L17 26V52H47V26L53 30L58 20L48 12L32 20L16 12Z" fill="#0F172A" stroke="#020617" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M22 12L32 30L42 12" fill="#FFFFFF" stroke="#020617" strokeWidth="1.5"/>
          <path d="M30 16L32 18L34 16L32 14Z" fill="#E11D48"/>
          <circle cx="32" cy="38" r="1.5" fill="#E2E8F0"/>
          <circle cx="32" cy="44" r="1.5" fill="#E2E8F0"/>
        </svg>
      );
    case 'overcoat':
    case 'longcoat':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 10L6 20L11 30L17 26V56H47V26L53 30L58 20L46 10L32 16L18 10Z" fill="#78350F" stroke="#451A03" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M22 10L32 28L42 10" fill="#FEF3C7" stroke="#451A03" strokeWidth="1.5"/>
          <path d="M17 34H47" stroke="#B45309" strokeWidth="3"/>
          <circle cx="32" cy="42" r="1.5" fill="#FEF3C7"/>
          <circle cx="32" cy="48" r="1.5" fill="#FEF3C7"/>
        </svg>
      );
    case 'leather_jacket':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 14L6 24L12 34L18 28V52H46V28L52 34L58 24L46 14H18Z" fill="#581C87" stroke="#3B0764" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M22 14L38 48" stroke="#E9D5FF" strokeWidth="2.5"/>
          <path d="M22 14L30 22M42 14L34 22" stroke="#3B0764" strokeWidth="2"/>
        </svg>
      );
    case 'kurta':
    case 'achkan':
    case 'sherwani':
    case 'dhoti_kurta':
    case 'kurta_pyjama':
    case 'pathani_suit':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M20 12L8 20L13 28L18 25V54L32 56L46 54V25L51 28L56 20L44 12H20Z" fill="#D97706" stroke="#78350F" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M28 12V26M36 12V26" stroke="#FEF3C7" strokeWidth="1.5"/>
          <path d="M32 12V32" stroke="#78350F" strokeWidth="2"/>
          <circle cx="32" cy="18" r="1" fill="#FEF3C7"/>
          <circle cx="32" cy="24" r="1" fill="#FEF3C7"/>
          <circle cx="32" cy="30" r="1" fill="#FEF3C7"/>
        </svg>
      );
    case 'sweat_shirt':
    case 'pullover':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 14L6 24L12 34L18 28V52H46V28L52 34L58 24L46 14C42 18 36 20 32 20C28 20 22 18 18 14Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M18 48H46V52H18V48Z" fill="#991B1B"/>
          <path d="M6 24L10 27M58 24L54 27" stroke="#991B1B" strokeWidth="2"/>
        </svg>
      );
    case 'sports_jacket':
    case 'track_suit':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 14L6 24L12 34L18 28V52H46V28L52 34L58 24L46 14H18Z" fill="#2563EB" stroke="#1E40AF" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M32 14V52" stroke="#FFFFFF" strokeWidth="2.5"/>
          <path d="M18 24H46" stroke="#FDE047" strokeWidth="2"/>
        </svg>
      );
    case 'shorts':
    case 'swimming_costume':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M16 16H48V22L45 42H34L32 28L30 42H19L16 22V16Z" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M16 22H48" stroke="#BAE6FD" strokeWidth="2"/>
        </svg>
      );
    case 'pyjama':
    case 'sweat_pants':
    case 'track_pant':
    case 'capri':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M17 14H47L44 54H33.5L32 26L30.5 54H20L17 14Z" fill="#64748B" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M17 20H47" stroke="#CBD5E1" strokeWidth="2"/>
          <path d="M18 14L18 54M46 14L46 54" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="3 3"/>
        </svg>
      );
    case 'sweater_half':
    case 'waist_coat':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M20 14H44L47 24V52H17V24L20 14Z" fill="#B45309" stroke="#78350F" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M24 14L32 28L40 14" fill="#FEF3C7" stroke="#78350F" strokeWidth="1.5"/>
          <circle cx="32" cy="34" r="1.5" fill="#FEF3C7"/>
          <circle cx="32" cy="42" r="1.5" fill="#FEF3C7"/>
        </svg>
      );
    case 'undershirt':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 14H42L45 22V52H19V22L22 14Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M26 14C28 20 36 20 38 14" stroke="#0284C7" strokeWidth="2"/>
        </svg>
      );
    case 'bath_robe':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 12L6 22L12 32L18 28V56H46V28L52 32L58 22L46 12H18Z" fill="#F1F5F9" stroke="#64748B" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M24 12L32 32L40 12" stroke="#64748B" strokeWidth="2"/>
          <path d="M14 36H50" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round"/>
        </svg>
      );
    case 'tie':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M28 14H36L34 20H30L28 14Z" fill="#1E40AF" stroke="#1D4ED8" strokeWidth="2"/>
          <path d="M30 20L34 20L37 46L32 54L27 46L30 20Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M28 28L36 34M28 38L36 44" stroke="#93C5FD" strokeWidth="1.5"/>
        </svg>
      );
    case 'laundry_garments':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M32 10C30 10 28 12 28 14C28 16 32 18 32 20M14 26L32 20L50 26" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="14" y="26" width="36" height="8" rx="2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2"/>
          <rect x="16" y="34" width="32" height="8" rx="2" fill="#10B981" stroke="#047857" strokeWidth="2"/>
          <rect x="18" y="42" width="28" height="8" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="2"/>
          <rect x="20" y="50" width="24" height="6" rx="2" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2"/>
        </svg>
      );
    case 'blouse':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M20 16L8 24L13 32L18 28V42H46V28L51 32L56 24L44 16H20Z" fill="#EC4899" stroke="#BE185D" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M26 16C28 24 36 24 38 16" stroke="#BE185D" strokeWidth="2"/>
        </svg>
      );
    case 'saree':
    case 'saree_heavy':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 14L10 24L16 30L20 26V54H44V26L48 30L54 24L46 14H18Z" fill="#BE123C" stroke="#881337" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M22 14L44 48" stroke="#FDE047" strokeWidth="4"/>
          <path d="M18 50H46" stroke="#FDE047" strokeWidth="3"/>
          <circle cx="32" cy="22" r="1.5" fill="#FEF08A"/>
        </svg>
      );
    case 'kurti':
    case 'anarkali':
    case 'dress':
    case 'salwar_kameez':
    case 'kaftan':
    case 'nighty':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 14L10 22L15 30L20 26V56L44 56V26L49 30L54 22L42 14H22Z" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M26 14C28 20 36 20 38 14" stroke="#6D28D9" strokeWidth="2"/>
          <path d="M20 50L44 50" stroke="#DDD6FE" strokeWidth="2"/>
        </svg>
      );
    case 'lehenga':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 14H42L44 24H20L22 14Z" fill="#EC4899" stroke="#9D174D" strokeWidth="2"/>
          <path d="M20 28H44L52 54H12L20 28Z" fill="#BE185D" stroke="#9D174D" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M14 48H50" stroke="#FDE047" strokeWidth="3"/>
        </svg>
      );
    case 'shawl':
    case 'stole':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M14 18C20 14 44 14 50 18L46 52C40 48 24 48 18 52L14 18Z" fill="#9333EA" stroke="#6B21A8" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M16 48L16 54M24 48L24 54M32 48L32 54M40 48L40 54M48 48L48 54" stroke="#FDE047" strokeWidth="2"/>
        </svg>
      );
    case 'skirt':
    case 'petticoat':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 16H42L48 48H16L22 16Z" fill="#0D9488" stroke="#115E59" strokeWidth="2.5" strokeLinejoin="round"/>
          <line x1="22" y1="20" x2="42" y2="20" stroke="#99F6E4" strokeWidth="2"/>
          <line x1="28" y1="20" x2="24" y2="48" stroke="#115E59" strokeWidth="1.5"/>
          <line x1="36" y1="20" x2="40" y2="48" stroke="#115E59" strokeWidth="1.5"/>
        </svg>
      );
    case 'kids_frock':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M24 16H40L42 26H22L24 16Z" fill="#F43F5E" stroke="#BE123C" strokeWidth="2"/>
          <path d="M22 26L14 50H50L42 26H22Z" fill="#FB7185" stroke="#BE123C" strokeWidth="2.5" strokeLinejoin="round"/>
          <circle cx="32" cy="36" r="3" fill="#FFF1F2"/>
        </svg>
      );
    case 'kids_shirt':
    case 'school_uniform':
    case 'dungaree':
    case 'kids_jacket':
    case 'kids_pant':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M20 18L10 26L14 32L18 30V48H46V30L50 32L54 26L44 18H20Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M28 18C29 22 35 22 36 18" stroke="#0284C7" strokeWidth="2"/>
          <circle cx="32" cy="28" r="2" fill="#E0F2FE"/>
          <circle cx="32" cy="36" r="2" fill="#E0F2FE"/>
        </svg>
      );
    case 'bedsheet_single':
    case 'bedsheet_double':
    case 'blanket':
    case 'blanket_single':
    case 'blanket_double':
    case 'quilt':
    case 'mattress':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="12" y="16" width="40" height="32" rx="4" fill="#6366F1" stroke="#4338CA" strokeWidth="2.5"/>
          <path d="M12 26H52" stroke="#EEF2FF" strokeWidth="2"/>
          <path d="M22 16V48M42 16V48" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3"/>
        </svg>
      );
    case 'curtains':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M10 14H54" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
          <path d="M14 17V50C18 46 22 46 26 50V17" fill="#F59E0B" stroke="#B45309" strokeWidth="2"/>
          <path d="M38 17V50C42 46 46 46 50 50V17" fill="#F59E0B" stroke="#B45309" strokeWidth="2"/>
        </svg>
      );
    case 'pillow':
    case 'cushion':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="14" y="18" width="36" height="28" rx="6" fill="#F87171" stroke="#DC2626" strokeWidth="2.5"/>
          <circle cx="32" cy="32" r="3" fill="#FEF2F2"/>
        </svg>
      );
    case 'towel':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="18" y="14" width="28" height="38" rx="3" fill="#14B8A6" stroke="#0F766E" strokeWidth="2.5"/>
          <path d="M18 42H46M18 46H46" stroke="#CCFBF1" strokeWidth="2"/>
        </svg>
      );
    case 'table_cloth':
    case 'sofa_cover':
    case 'carpet':
    case 'table_runner':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="12" y="18" width="40" height="28" rx="3" fill="#EC4899" stroke="#BE185D" strokeWidth="2.5"/>
          <rect x="18" y="24" width="28" height="16" rx="2" stroke="#FDF2F8" strokeWidth="2"/>
        </svg>
      );
    case 'chef_coat':
    case 'doctor_apron':
    case 'lab_coat':
    case 'security_uniform':
    case 'hotel_linen':
    case 'salon_cape':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 12L6 22L12 32L18 28V54H46V28L52 32L58 22L46 12H18Z" fill="#F8FAFC" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round"/>
          <circle cx="28" cy="26" r="1.5" fill="#0284C7"/>
          <circle cx="36" cy="26" r="1.5" fill="#0284C7"/>
          <circle cx="28" cy="34" r="1.5" fill="#0284C7"/>
          <circle cx="36" cy="34" r="1.5" fill="#0284C7"/>
        </svg>
      );
    case 'cap':
    case 'helmet':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 36C18 24 24 18 36 18C44 18 48 24 48 36H18Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2.5"/>
          <path d="M16 36H52C56 36 58 40 54 44H16V36Z" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="2"/>
        </svg>
      );
    case 'gloves':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M22 28V16H26V28M26 14H30V28M30 16H34V28M34 20H38V32M22 28L18 32V48H40V34L38 32" stroke="#DC2626" strokeWidth="2.5" fill="#F87171" strokeLinejoin="round"/>
        </svg>
      );
    case 'handbag':
    case 'backpack':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M24 24V16C24 12 40 12 40 16V24" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
          <rect x="14" y="24" width="36" height="28" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="2.5"/>
          <circle cx="32" cy="36" r="3" fill="#FEF3C7"/>
        </svg>
      );
    case 'shoes':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M12 36C12 36 16 28 26 28C32 28 36 34 46 34C52 34 54 42 54 46H12V36Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M10 46H56V50H10V46Z" fill="#94A3B8"/>
        </svg>
      );
    case 'belt':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="10" y="24" width="44" height="16" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="2.5"/>
          <rect x="22" y="20" width="16" height="24" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="2"/>
          <rect x="26" y="26" width="8" height="12" fill="#78350F"/>
        </svg>
      );
    case 'soft_toy':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="20" cy="20" r="6" fill="#D97706"/>
          <circle cx="44" cy="20" r="6" fill="#D97706"/>
          <circle cx="32" cy="28" r="14" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5"/>
          <circle cx="27" cy="26" r="2" fill="#451A03"/>
          <circle cx="37" cy="26" r="2" fill="#451A03"/>
          <ellipse cx="32" cy="34" rx="5" ry="3" fill="#FEF3C7"/>
          <circle cx="32" cy="33" r="1.5" fill="#451A03"/>
        </svg>
      );
    case 'eco_leaf':
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M18 46C18 46 16 32 30 20C44 8 50 14 50 14C50 14 52 28 38 40C26 50 18 46 18 46Z" fill="#10B981" stroke="#047857" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M18 46C26 38 34 30 46 18" stroke="#ECFDF5" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
  }
};
