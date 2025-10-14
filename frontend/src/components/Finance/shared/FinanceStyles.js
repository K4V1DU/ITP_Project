// src/components/Finance/shared/FinanceStyles.js

export const financeColors = {
  // Primary Palette
  primary: "#6366F1", // Indigo
  primaryDark: "#4F46E5",
  primaryLight: "#818CF8",
  
  // Accent Colors
  success: "#10B981",
  successLight: "#34D399",
  warning: "#F59E0B",
  warningLight: "#FBBF24",
  error: "#EF4444",
  errorLight: "#F87171",
  info: "#3B82F6",
  
  // Backgrounds
  bgGradient1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  bgGradient2: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  bgGradient3: "linear-gradient(135deg, #3B82F6 0%, #2DD4BF 100%)",
  bgGradient4: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
  bgLight: "#F8FAFC",
  bgCard: "#FFFFFF",
  
  // Status Colors
  approved: "#10B981",
  pending: "#F59E0B",
  rejected: "#EF4444",
};

export const financeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ==================== ANIMATIONS ==================== */
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    }
    50% {
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* ==================== UTILITY CLASSES ==================== */

  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards !important;
  }

  .animate-fadeInDown {
    animation: fadeInDown 0.6s ease-out forwards !important;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.6s ease-out forwards !important;
  }

  .animate-slideInRight {
    animation: slideInRight 0.6s ease-out forwards !important;
  }

  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards !important;
  }

  .animate-pulse {
    animation: pulse 2s ease-in-out infinite !important;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite !important;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite !important;
  }

  .rotating {
    animation: rotate 1s linear infinite !important;
  }

  /* ==================== GLASS MORPHISM ==================== */

  .glass-card {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  }

  .glass-dark {
    background: rgba(99, 102, 241, 0.1) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(99, 102, 241, 0.2) !important;
  }

  /* ==================== HOVER EFFECTS ==================== */

  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .hover-lift:hover {
    transform: translateY(-8px) !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
  }

  .hover-scale {
    transition: transform 0.3s ease !important;
  }

  .hover-scale:hover {
    transform: scale(1.05) !important;
  }

  .hover-glow:hover {
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.5) !important;
  }

  /* ==================== GRADIENT BACKGROUND ==================== */

  .finance-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    background-size: 400% 400% !important;
    animation: gradientShift 15s ease infinite !important;
    position: relative;
    overflow: hidden;
  }

  .finance-bg-light {
    background: linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 50%, #F3F4F6 100%) !important;
    background-size: 400% 400% !important;
    animation: gradientShift 20s ease infinite !important;
  }

  /* ==================== PARTICLE EFFECTS ==================== */

  .particles {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }

  .particle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
  .particle:nth-child(2) { top: 40%; left: 30%; animation-delay: 1s; }
  .particle:nth-child(3) { top: 60%; left: 50%; animation-delay: 2s; }
  .particle:nth-child(4) { top: 80%; left: 70%; animation-delay: 3s; }
  .particle:nth-child(5) { top: 30%; left: 80%; animation-delay: 4s; }

  /* ==================== TABLE STYLES ==================== */

  .finance-table-row {
    transition: all 0.3s ease !important;
  }

  .finance-table-row:hover {
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05)) !important;
    transform: translateX(5px) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  }

  /* ==================== BUTTON STYLES ==================== */

  .finance-button {
    position: relative !important;
    overflow: hidden !important;
    transition: all 0.3s ease !important;
  }

  .finance-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .finance-button:hover::before {
    width: 300px;
    height: 300px;
  }

  /* ==================== SCROLLBAR ==================== */

  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #F1F5F9;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
  }

  /* ==================== SHIMMER EFFECT ==================== */

  .shimmer {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    ) !important;
    background-size: 200% 100% !important;
    animation: shimmer 2s infinite !important;
    pointer-events: none;
  }

  /* ==================== STAT CARD FIX ==================== */
  
  .MuiCard-root.glass-card {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  .MuiCardContent-root {
    position: relative;
    z-index: 1;
  }

  /* ==================== RESPONSIVE ==================== */

  @media (max-width: 768px) {
    .hover-lift:hover {
      transform: translateY(-4px) !important;
    }
    
    .animate-float {
      animation: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

export const statusConfig = {
  Approved: {
    label: "APPROVED",
    color: "#10B981",
    bgColor: "#D1FAE5",
    gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  },
  Pending: {
    label: "PENDING",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
  },
  Rejected: {
    label: "REJECTED",
    color: "#EF4444",
    bgColor: "#FEE2E2",
    gradient: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
  },
};

