import React from 'react';
import { ProceduralArchetype } from '../../domain/types';
import { htmlEquipmentModuleRegistry } from '../../three-runtime/HtmlEquipmentModuleRegistry';

interface EquipmentThumbnailSvgProps {
  archetype: ProceduralArchetype;
  assetId?: string;
  className?: string;
}

export const EquipmentThumbnailSvg: React.FC<EquipmentThumbnailSvgProps> = ({
  archetype,
  assetId,
  className = 'w-14 h-14',
}) => {
  const customModule = assetId
    ? htmlEquipmentModuleRegistry.getModule(assetId)
    : htmlEquipmentModuleRegistry.getByArchetypeOrSlug(archetype);

  if (customModule && customModule.iconSvgMarkup) {
    return (
      <div
        className={`${className} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full`}
        dangerouslySetInnerHTML={{ __html: customModule.iconSvgMarkup }}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="35%" stopColor="#F8FAFC" />
          <stop offset="70%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="35%" stopColor="#FDE68A" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(186,230,253,0.55)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="75%" stopColor="rgba(224,242,254,0.35)" />
          <stop offset="100%" stopColor="rgba(125,211,252,0.65)" />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.68)" />
          <stop offset="50%" stopColor="rgba(14,165,233,0.58)" />
          <stop offset="100%" stopColor="rgba(2,132,199,0.75)" />
        </linearGradient>
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(18,52,107,0.22)" />
          <stop offset="70%" stopColor="rgba(18,52,107,0.08)" />
          <stop offset="100%" stopColor="rgba(18,52,107,0)" />
        </radialGradient>
      </defs>

      {/* Soft ground contact shadow */}
      <ellipse cx="48" cy="82" rx="32" ry="6" fill="url(#shadowGrad)" />

      {archetype === 'electronic-balance' && (
        <g>
          {/* 4 Chân đế xoay chỉnh thăng bằng màu đỏ hồng OHAUS */}
          <ellipse cx="21" cy="76" rx="6.5" ry="2.6" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
          <ellipse cx="75" cy="76" rx="6.5" ry="2.6" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
          <ellipse cx="25" cy="54" rx="5" ry="2" fill="#E11D48" />
          <ellipse cx="71" cy="54" rx="5" ry="2" fill="#E11D48" />

          {/* Đế gầm màu xám bạc bo tròn */}
          <path
            d="M15 68 C15 66 17 65 20 65 H76 C79 65 81 66 81 68 L79 75 C79 76.5 77 77.5 74 77.5 H22 C19 77.5 17 76.5 17 75 Z"
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />

          {/* Thân cân màu trắng sứ bo tròn mềm mại và lượn eo OHAUS Scout */}
          <path
            d="M21 44 C21 41 24 39 28 39 H68 C72 39 75 41 75 44 C73 51 74 58 80 66 C81 68 79 73 75 73 H21 C17 73 15 68 16 66 C22 58 23 51 21 44 Z"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.6"
          />

          {/* Màn hình LCD nền trắng xanh sáng có 2 viền đỏ trên/dưới */}
          <rect
            x="29"
            y="49"
            width="36"
            height="12"
            rx="2"
            fill="#DCE7F5"
            stroke="#94A3B8"
            strokeWidth="1"
          />
          <line x1="30" y1="49.8" x2="64" y2="49.8" stroke="#DC2626" strokeWidth="1.4" />
          <line x1="30" y1="60.2" x2="64" y2="60.2" stroke="#DC2626" strokeWidth="1.4" />
          <text
            x="61"
            y="58.2"
            fill="#0F172A"
            fontSize="8.8"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="end"
          >
            0.00g
          </text>

          {/* Logo OHAUS đỏ bên trái & Giọt nước cân bằng bên phải */}
          <polygon points="21,54 25,51 27,55 23,57" fill="#DC2626" />
          <circle cx="70.5" cy="53.5" r="2.8" fill="#DBEAFE" stroke="#DC2626" strokeWidth="1" />

          {/* 4 Phím bấm chữ nhật viền đỏ bên dưới màn hình */}
          {[24, 36.5, 49, 61.5].map((bx, i) => (
            <rect
              key={i}
              x={bx}
              y="63.5"
              width="10"
              height="6"
              rx="1.2"
              fill="#FFFFFF"
              stroke="#DC2626"
              strokeWidth="1"
            />
          ))}

          {/* Đĩa cân Inox hình chữ nhật bo tròn 4 góc và vát mép */}
          <rect
            x="21"
            y="27"
            width="54"
            height="17"
            rx="6"
            fill="url(#metalGrad)"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          <rect
            x="23"
            y="28"
            width="50"
            height="13.5"
            rx="5"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
        </g>
      )}

      {archetype === 'graduated-cylinder' && (
        <g>
          {/* Hexagonal base */}
          <polygon
            points="27,79 69,79 64,73 32,73"
            fill="url(#glassGrad)"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          {/* Tall slender glass cylinder */}
          <rect
            x="37"
            y="14"
            width="22"
            height="60"
            rx="1.5"
            fill="url(#glassGrad)"
            stroke="#38BDF8"
            strokeWidth="1.6"
          />
          {/* Water column */}
          <rect x="38.2" y="41" width="19.6" height="32" fill="url(#waterGrad)" />
          {/* Meniscus curve */}
          <path
            d="M38.2 41 Q48 44.5 57.8 41"
            stroke="#0284C7"
            strokeWidth="1.8"
            fill="rgba(125,211,252,0.55)"
          />
          {/* Top rim lip */}
          <ellipse
            cx="48"
            cy="14"
            rx="11.5"
            ry="2.5"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="1.4"
          />
          {/* Graduation ticks */}
          {[22, 28, 34, 40, 46, 52, 58, 64].map((y, i) => (
            <line
              key={y}
              x1="41"
              y1={y}
              x2={i % 2 === 0 ? '50' : '46'}
              y2={y}
              stroke="#0B3A7D"
              strokeWidth={i % 2 === 0 ? '1.5' : '1'}
            />
          ))}
          {/* Glass specular highlight */}
          <line
            x1="40"
            y1="18"
            x2="40"
            y2="71"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {archetype === 'overflow-can' && (
        <g>
          {/* Transparent vessel body */}
          <rect
            x="22"
            y="22"
            width="38"
            height="56"
            rx="3"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
          {/* Water filled up to spout level */}
          <rect x="23.5" y="38" width="35" height="38.5" rx="1.5" fill="url(#waterGrad)" />
          <path
            d="M23.5 38 Q41 40.5 58.5 38"
            stroke="#0284C7"
            strokeWidth="1.6"
            fill="none"
          />
          {/* Top rim */}
          <ellipse
            cx="41"
            cy="22"
            rx="19"
            ry="3"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
          {/* Angled overflow spout tube */}
          <path
            d="M60 36 L79 49 L77 53 L59 41 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
          {/* Water droplet at spout tip */}
          <circle cx="79" cy="55" r="2.5" fill="#00BCEB" />
          {/* Specular reflection */}
          <line
            x1="26"
            y1="27"
            x2="26"
            y2="73"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {archetype === 'beaker-250' && (
        <g>
          {/* Low wide glass beaker body */}
          <path
            d="M23 28 L25 74 Q25 78 29 78 H67 Q71 78 71 74 L73 28 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
          {/* Water inside */}
          <path
            d="M25.5 52 H70.5 L69.5 73.5 Q69.5 76.5 66 76.5 H30 Q26.5 76.5 26.5 73.5 Z"
            fill="url(#waterGrad)"
          />
          <ellipse
            cx="48"
            cy="52"
            rx="22.2"
            ry="2.5"
            fill="rgba(125,211,252,0.55)"
            stroke="#0284C7"
            strokeWidth="1.2"
          />
          {/* Top open mouth rim */}
          <ellipse
            cx="48"
            cy="28"
            rx="25.5"
            ry="3.5"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
          {/* Graduation lines */}
          {[38, 46, 54, 62, 70].map((y, i) => (
            <line
              key={y}
              x1="33"
              y1={y}
              x2={i % 2 === 0 ? '45' : '40'}
              y2={y}
              stroke="#0B3A7D"
              strokeWidth="1.4"
            />
          ))}
          <line
            x1="29"
            y1="33"
            x2="30"
            y2="72"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {archetype === 'solid-cylinder' && (
        <g>
          {/* Top hook ring */}
          <circle
            cx="48"
            cy="20"
            r="4.5"
            stroke="#475569"
            strokeWidth="2.2"
            fill="none"
          />
          {/* Metallic cylinder body */}
          <path
            d="M31 28 V69 C31 73 65 73 65 69 V28 Z"
            fill="url(#metalGrad)"
            stroke="#475569"
            strokeWidth="1.6"
          />
          {/* Top metallic ellipse */}
          <ellipse
            cx="48"
            cy="28"
            rx="17"
            ry="5"
            fill="#F1F5F9"
            stroke="#475569"
            strokeWidth="1.6"
          />
          {/* Metallic sheen */}
          <line
            x1="37"
            y1="33"
            x2="37"
            y2="68"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {archetype === 'calibration-weight' && (
        <g>
          <path
            d="M32 38 V72 C32 76 64 76 64 72 V38 Z"
            fill="url(#brassGrad)"
            stroke="#92400E"
            strokeWidth="1.6"
          />
          <ellipse
            cx="48"
            cy="38"
            rx="16"
            ry="4.5"
            fill="#FDE68A"
            stroke="#92400E"
            strokeWidth="1.5"
          />
          <rect
            x="42"
            y="29"
            width="12"
            height="8"
            rx="1.5"
            fill="url(#brassGrad)"
            stroke="#92400E"
            strokeWidth="1.4"
          />
          <ellipse
            cx="48"
            cy="27"
            rx="10"
            ry="3.5"
            fill="#FDE68A"
            stroke="#92400E"
            strokeWidth="1.5"
          />
          <text
            x="48"
            y="59"
            fill="#78350F"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            50g
          </text>
        </g>
      )}

      {archetype === 'spring-dynamometer' && (
        <g>
          <circle cx="48" cy="14" r="4.5" stroke="#475569" strokeWidth="2" />
          <rect
            x="38"
            y="19"
            width="20"
            height="46"
            rx="3"
            fill="url(#glassGrad)"
            stroke="#475569"
            strokeWidth="1.6"
          />
          <path
            d="M48 23 L43 27 L53 31 L43 35 L53 39 L48 44"
            stroke="#D97706"
            strokeWidth="1.8"
            fill="none"
          />
          <rect x="40" y="44" width="16" height="3.5" rx="1" fill="#EF4444" />
          <line x1="48" y1="47" x2="48" y2="71" stroke="#475569" strokeWidth="2.2" />
          <path
            d="M48 71 C48 77 56 77 55 71"
            stroke="#475569"
            strokeWidth="2.2"
            fill="none"
          />
        </g>
      )}

      {archetype === 'vernier-caliper' && (
        <g>
          <rect
            x="12"
            y="34"
            width="72"
            height="10"
            rx="1.5"
            fill="url(#metalGrad)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <polygon
            points="12,34 22,34 22,68 16,68 12,56"
            fill="url(#metalGrad)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <polygon
            points="38,31 54,31 54,46 45,46 45,68 38,56"
            fill="#1E6BFF"
            fillOpacity="0.2"
            stroke="#1E6BFF"
            strokeWidth="1.8"
          />
        </g>
      )}

      {archetype === 'solid-sphere' && (
        <g>
          <circle
            cx="48"
            cy="52"
            r="22"
            fill="url(#metalGrad)"
            stroke="#475569"
            strokeWidth="1.6"
          />
          <ellipse
            cx="41"
            cy="43"
            rx="6"
            ry="3.5"
            transform="rotate(-25 41 43)"
            fill="#FFFFFF"
            fillOpacity="0.75"
          />
        </g>
      )}

      {archetype === 'solid-block' && (
        <g>
          <polygon
            points="22,44 48,32 74,44 48,56"
            fill="#FDE68A"
            stroke="#92400E"
            strokeWidth="1.6"
          />
          <polygon
            points="22,44 48,56 48,74 22,62"
            fill="#F59E0B"
            stroke="#92400E"
            strokeWidth="1.6"
          />
          <polygon
            points="74,44 48,56 48,74 74,62"
            fill="#D97706"
            stroke="#92400E"
            strokeWidth="1.6"
          />
        </g>
      )}

      {archetype === 'hollow-cylinder' && (
        <g>
          <path
            d="M29 28 V69 C29 74 67 74 67 69 V28 Z"
            fill="url(#brassGrad)"
            stroke="#9A3412"
            strokeWidth="1.6"
          />
          <ellipse
            cx="48"
            cy="28"
            rx="19"
            ry="5.5"
            fill="#FDBA74"
            stroke="#9A3412"
            strokeWidth="1.6"
          />
          <ellipse cx="48" cy="28" rx="11" ry="3.2" fill="#431407" />
        </g>
      )}

      {archetype === 'erlenmeyer-flask' && (
        <g>
          <path
            d="M41 18 H55 V34 L72 72 Q74 76 69 76 H27 Q22 76 24 72 L41 34 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
          <path
            d="M31 56 H65 L71 71 Q72 74.5 68 74.5 H28 Q24 74.5 25 71 Z"
            fill="url(#waterGrad)"
          />
          <ellipse
            cx="48"
            cy="18"
            rx="7.5"
            ry="2"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
        </g>
      )}

      {archetype === 'retort-stand' && (
        <g>
          <rect
            x="20"
            y="72"
            width="56"
            height="6"
            rx="2"
            fill="#334155"
            stroke="#1E293B"
            strokeWidth="1.5"
          />
          <line x1="32" y1="16" x2="32" y2="72" stroke="#64748B" strokeWidth="3.5" />
          <rect x="27" y="26" width="11" height="9" rx="1.5" fill="#1E6BFF" />
          <line x1="38" y1="30.5" x2="66" y2="30.5" stroke="#64748B" strokeWidth="3" />
          <circle cx="64" cy="35" r="3.5" stroke="#0284C7" strokeWidth="1.8" />
        </g>
      )}

      {archetype === 'optical-lens' && (
        <g>
          <rect x="30" y="72" width="36" height="6" rx="2" fill="#334155" />
          <line x1="48" y1="54" x2="48" y2="72" stroke="#475569" strokeWidth="3.5" />
          <circle cx="48" cy="35" r="19" stroke="#1E293B" strokeWidth="3" />
          <ellipse
            cx="48"
            cy="35"
            rx="8"
            ry="17"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
        </g>
      )}

      {archetype === 'thermometer' && (
        <g>
          <rect
            x="43"
            y="14"
            width="10"
            height="54"
            rx="5"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
          <circle
            cx="48"
            cy="70"
            r="7.5"
            fill="#EF4444"
            stroke="#B91C1C"
            strokeWidth="1.5"
          />
          <line x1="48" y1="32" x2="48" y2="65" stroke="#EF4444" strokeWidth="3.2" />
        </g>
      )}

      {archetype === 'laser-source' && (
        <g>
          <rect
            x="16"
            y="34"
            width="42"
            height="30"
            rx="4"
            fill="#F1F5F9"
            stroke="#475569"
            strokeWidth="1.6"
          />
          <rect x="24" y="39" width="12" height="5" rx="1.5" fill="#EF4444" />
          <rect x="24" y="46.5" width="12" height="5" rx="1.5" fill="#EF4444" />
          <rect x="24" y="54" width="12" height="5" rx="1.5" fill="#EF4444" />
          <line x1="58" y1="41.5" x2="86" y2="41.5" stroke="#FF1E42" strokeWidth="2.4" />
          <line x1="58" y1="49" x2="86" y2="49" stroke="#FF1E42" strokeWidth="2.4" />
          <line x1="58" y1="56.5" x2="86" y2="56.5" stroke="#FF1E42" strokeWidth="2.4" />
        </g>
      )}

      {archetype === 'semicircular-slab' && (
        <g>
          <circle
            cx="48"
            cy="48"
            r="32"
            fill="#F8FAFC"
            stroke="#0B3A7D"
            strokeWidth="1.8"
          />
          <line x1="48" y1="16" x2="48" y2="80" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="16" y1="48" x2="80" y2="48" stroke="#64748B" strokeWidth="1.4" />
          <path
            d="M26 48 A22 22 0 0 1 70 48 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          <line x1="25" y1="72" x2="48" y2="48" stroke="#EF4444" strokeWidth="2.2" />
          <line x1="48" y1="48" x2="64" y2="23" stroke="#22C55E" strokeWidth="2.2" />
          <line x1="48" y1="48" x2="71" y2="72" stroke="#F59E0B" strokeWidth="1.6" strokeDasharray="2 2" />
        </g>
      )}

      {archetype === 'optical-prism' && (
        <g>
          <polygon
            points="48,18 22,66 74,66"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="2"
          />
          <line x1="12" y1="52" x2="35" y2="42" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="61" y1="42" x2="86" y2="45" stroke="#EF4444" strokeWidth="2" />
          <line x1="62" y1="45" x2="86" y2="50" stroke="#F59E0B" strokeWidth="2" />
          <line x1="63" y1="48" x2="86" y2="55" stroke="#22C55E" strokeWidth="2" />
          <line x1="64" y1="51" x2="86" y2="60" stroke="#3B82F6" strokeWidth="2" />
          <line x1="65" y1="54" x2="86" y2="65" stroke="#8B5CF6" strokeWidth="2" />
          <rect x="30" y="72" width="36" height="5" rx="2" fill="#334155" />
        </g>
      )}

      {archetype === 'magnifying-glass' && (
        <g>
          <circle
            cx="42"
            cy="38"
            r="21"
            fill="url(#glassGrad)"
            stroke="#1E293B"
            strokeWidth="4.5"
          />
          <line
            x1="57"
            y1="53"
            x2="76"
            y2="74"
            stroke="#1E293B"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <text
            x="42"
            y="42"
            fill="#0B3A7D"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
          >
            5x
          </text>
        </g>
      )}

      {archetype === 'galvanometer' && (
        <g>
          <rect
            x="22"
            y="18"
            width="52"
            height="58"
            rx="4"
            fill="#F1F5F9"
            stroke="#334155"
            strokeWidth="2"
          />
          <rect
            x="28"
            y="24"
            width="40"
            height="28"
            rx="2"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path d="M33 46 A18 18 0 0 1 63 46" stroke="#0B3A7D" strokeWidth="1.5" fill="none" />
          <line x1="48" y1="48" x2="48" y2="29" stroke="#EF4444" strokeWidth="2" />
          <text x="48" y="45" fill="#0B3A7D" fontSize="9" fontWeight="bold" textAnchor="middle">
            G
          </text>
          <circle cx="34" cy="64" r="4" fill="#0F172A" />
          <circle cx="48" cy="64" r="4" fill="#EF4444" />
          <circle cx="62" cy="64" r="4" fill="#EF4444" />
        </g>
      )}

      {archetype === 'digital-multimeter' && (
        <g>
          <rect
            x="25"
            y="14"
            width="46"
            height="64"
            rx="6"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="2"
          />
          <rect x="29" y="18" width="38" height="56" rx="4" fill="#1E293B" />
          <rect x="33" y="22" width="30" height="14" rx="2" fill="#051C18" stroke="#14B8A6" strokeWidth="1" />
          <text x="60" y="32" fill="#5EEAD4" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="end">
            12.0V
          </text>
          <circle cx="48" cy="50" r="10" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="48" y1="50" x2="54" y2="44" stroke="#FACC15" strokeWidth="2" />
          <circle cx="37" cy="67" r="3" fill="#EF4444" />
          <circle cx="48" cy="67" r="3" fill="#EF4444" />
          <circle cx="59" cy="67" r="3" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
        </g>
      )}

      {archetype === 'induction-coil-led' && (
        <g>
          <rect x="14" y="68" width="68" height="7" rx="2" fill="#9A5B25" />
          <rect x="16" y="42" width="24" height="12" rx="1.5" fill="#2563EB" />
          <rect x="28" y="42" width="14" height="12" rx="1.5" fill="#EF4444" />
          <rect
            x="48"
            y="34"
            width="28"
            height="34"
            rx="3"
            fill="url(#brassGrad)"
            stroke="#92400E"
            strokeWidth="1.6"
          />
          <circle cx="55" cy="26" r="4.5" fill="#EF4444" />
          <circle cx="69" cy="26" r="4.5" fill="#22C55E" />
        </g>
      )}

      {archetype === 'porcelain-dish' && (
        <g>
          <path
            d="M18 46 Q20 74 48 74 Q76 74 78 46 Z"
            fill="#F8FAFC"
            stroke="#64748B"
            strokeWidth="2"
          />
          <ellipse
            cx="48"
            cy="46"
            rx="30"
            ry="6"
            fill="#E2E8F0"
            stroke="#64748B"
            strokeWidth="1.6"
          />
          <path
            d="M48 22 Q58 36 53 45 Q48 48 43 45 Q38 36 48 22 Z"
            fill="#38BDF8"
            opacity="0.75"
          />
          <path
            d="M48 29 Q53 38 50 44 Q48 46 46 44 Q43 38 48 29 Z"
            fill="#FBBF24"
          />
        </g>
      )}

      {archetype === 'separatory-funnel' && (
        <g>
          <line x1="26" y1="14" x2="26" y2="76" stroke="#475569" strokeWidth="3.5" />
          <rect x="18" y="74" width="56" height="5" rx="2" fill="#334155" />
          <path
            d="M42 18 H58 L64 34 L50 56 L36 34 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
          <polygon points="39,34 61,34 57,42 43,42" fill="#FBBF24" opacity="0.8" />
          <polygon points="43,42 57,42 50,55" fill="#38BDF8" opacity="0.75" />
          <line x1="50" y1="56" x2="50" y2="72" stroke="#0284C7" strokeWidth="3" />
          <rect x="43" y="59" width="14" height="4" rx="1.5" fill="#EF4444" />
        </g>
      )}

      {archetype === 'distillation-flask' && (
        <g>
          {/* Standalone round-bottom side-arm flask */}
          <ellipse cx="46" cy="74" rx="14" ry="3.5" fill="#78350F" />
          <circle
            cx="46"
            cy="52"
            r="20"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          <path d="M28 56 A18 18 0 0 0 64 56 Z" fill="url(#waterGrad)" />
          <rect x="41" y="16" width="10" height="18" fill="url(#glassGrad)" stroke="#0284C7" strokeWidth="1.6" />
          <line x1="51" y1="24" x2="78" y2="40" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {archetype === 'alcohol-burner' && (
        <g>
          {/* Glass base & bulbous body */}
          <rect x="26" y="72" width="44" height="5" rx="2.5" fill="url(#glassGrad)" stroke="#0284C7" strokeWidth="1.5" />
          <path
            d="M28 72 L24 54 L36 40 H60 L72 54 L68 72 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          {/* Blue ethanol fuel */}
          <path d="M29 70 L26 57 H70 L67 70 Z" fill="url(#waterGrad)" opacity="0.85" />
          {/* Cotton wick inside */}
          <line x1="48" y1="36" x2="48" y2="68" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" />
          {/* Brass wick collar */}
          <rect x="41" y="33" width="14" height="7" rx="1.5" fill="url(#brassGrad)" stroke="#92400E" strokeWidth="1.4" />
          {/* Multi-layer alcohol flame */}
          <path
            d="M48 11 Q59 23 54 32 Q48 35 42 32 Q37 23 48 11 Z"
            fill="#F97316"
          />
          <path
            d="M48 16 Q55 25 52 31 Q48 33 44 31 Q41 25 48 16 Z"
            fill="#FEF08A"
          />
          <path
            d="M48 23 Q51 28 50 32 Q48 33 46 32 Q45 28 48 23 Z"
            fill="#38BDF8"
          />
          {/* Snuffer cap resting on right */}
          <rect x="73" y="60" width="9" height="14" rx="2" fill="url(#glassGrad)" stroke="#0284C7" strokeWidth="1.3" />
        </g>
      )}

      {archetype === 'tripod-wire-gauze' && (
        <g>
          {/* Wire gauze & white ceramic heat diffuser pad */}
          <rect x="18" y="24" width="60" height="4.5" rx="1.5" fill="#94A3B8" stroke="#475569" strokeWidth="1.4" />
          <ellipse cx="48" cy="24" rx="18" ry="2.2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
          {/* Cast iron ring */}
          <rect x="22" y="28.5" width="52" height="5" rx="2" fill="#334155" stroke="#1E293B" strokeWidth="1.4" />
          {/* 3 Steel tripod legs */}
          <line x1="27" y1="33" x2="20" y2="76" stroke="#334155" strokeWidth="3.8" strokeLinecap="round" />
          <line x1="48" y1="33" x2="48" y2="76" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="69" y1="33" x2="76" y2="76" stroke="#334155" strokeWidth="3.8" strokeLinecap="round" />
        </g>
      )}

      {archetype === 'ice-cubes-tray' && (
        <g>
          {/* Glass Petri tray */}
          <path
            d="M16 54 V68 C16 74 80 74 80 68 V54 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
          <ellipse cx="48" cy="54" rx="32" ry="6" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.4" />
          {/* 3D Translucent Ice Cubes */}
          <rect x="25" y="39" width="15" height="14" rx="2.5" transform="rotate(-10 32 46)" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="42" y="35" width="16" height="15" rx="2.5" transform="rotate(8 50 42)" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="55" y="41" width="14" height="13" rx="2.5" transform="rotate(-6 62 47)" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="34" y="27" width="15" height="14" rx="2.5" transform="rotate(14 41 34)" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
        </g>
      )}

      {archetype === 'thermal-heating-vessel' && (
        <g>
          {/* Pyrex Borosilicate heating vessel */}
          <path
            d="M23 20 H73 L71 71 Q71 76 65 76 H31 Q25 76 25 71 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          {/* Orange heat-resistant grip band */}
          <rect x="23.5" y="25" width="49" height="6" fill="#EA580C" rx="1" />
          {/* Liquid water at bottom */}
          <path
            d="M26 52 H70 L69.5 70 Q69.5 74 64 74 H32 Q26.5 74 26.5 70 Z"
            fill="url(#waterGrad)"
          />
          {/* Floating Ice Cubes inside vessel */}
          <rect x="30" y="45" width="11" height="10" rx="2" transform="rotate(-12 35 50)" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.3" />
          <rect x="44" y="46" width="12" height="10" rx="2" transform="rotate(10 50 51)" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.3" />
          <rect x="56" y="44" width="10" height="9" rx="2" transform="rotate(-6 61 48)" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.3" />
          {/* Rising steam / graduation lines */}
          <line x1="60" y1="38" x2="66" y2="38" stroke="#0284C7" strokeWidth="1.4" />
          <line x1="58" y1="46" x2="66" y2="46" stroke="#0284C7" strokeWidth="1.4" />
          <line x1="60" y1="54" x2="66" y2="54" stroke="#0284C7" strokeWidth="1.4" />
        </g>
      )}

      {archetype === 'optical-microscope' && (
        <g>
          <rect x="24" y="72" width="48" height="6" rx="2" fill="#1E293B" />
          <path
            d="M34 72 V34 Q34 24 46 24 H54"
            stroke="#F1F5F9"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <line x1="56" y1="14" x2="48" y2="30" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          <rect x="36" y="50" width="30" height="4" rx="1" fill="#1E293B" />
          <rect x="44" y="46" width="16" height="2.5" fill="#38BDF8" />
          <line x1="48" y1="32" x2="48" y2="43" stroke="#EAB308" strokeWidth="3.5" />
          <line x1="54" y1="32" x2="58" y2="42" stroke="#3B82F6" strokeWidth="3.5" />
        </g>
      )}

      {archetype === 'dna-double-helix' && (
        <g>
          <rect x="28" y="74" width="40" height="5" rx="2" fill="#1E293B" />
          <path
            d="M34 16 C62 28, 34 44, 62 56 C34 68, 62 72, 48 74"
            stroke="#0EA5E9"
            strokeWidth="3.5"
            fill="none"
          />
          <path
            d="M62 16 C34 28, 62 44, 34 56 C62 68, 34 72, 48 74"
            stroke="#38BDF8"
            strokeWidth="3.5"
            fill="none"
          />
          {[22, 32, 42, 52, 62].map((y, idx) => (
            <line
              key={y}
              x1="38"
              y1={y}
              x2="58"
              y2={y}
              stroke={idx % 2 === 0 ? '#EF4444' : '#22C55E'}
              strokeWidth="2.5"
            />
          ))}
        </g>
      )}

      {archetype === 'water-dispenser' && (
        <g>
          {/* Tripod stand */}
          <rect x="24" y="58" width="44" height="5" rx="2" fill="#334155" />
          <line x1="28" y1="63" x2="25" y2="79" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="46" y1="63" x2="46" y2="79" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="64" y1="63" x2="67" y2="79" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          {/* Graduated glass reservoir carboy */}
          <rect
            x="25"
            y="18"
            width="42"
            height="40"
            rx="4"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.6"
          />
          {/* Water column */}
          <rect x="26.5" y="25" width="39" height="31.5" rx="2" fill="url(#waterGrad)" />
          {/* Blue GL45 Screw cap */}
          <rect x="37" y="11" width="18" height="7" rx="2" fill="#1E6BFF" stroke="#0B3A7D" strokeWidth="1" />
          {/* Digital ml badge */}
          <rect x="31" y="57.5" width="30" height="7" rx="1.5" fill="#041E19" stroke="#14B8A6" strokeWidth="0.9" />
          <text x="46" y="63" fill="#67E8F9" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            850 ml
          </text>
          {/* Metering valve & nozzle on right */}
          <rect x="67" y="50" width="12" height="4" rx="1" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
          <rect x="75" y="50" width="4" height="10" rx="1" fill="#94A3B8" />
          <rect x="69" y="45" width="8" height="3.5" rx="1" fill="#00BCEB" />
          <circle cx="77" cy="64" r="2.2" fill="#38BDF8" />
        </g>
      )}

      {(archetype === 'dc-battery-holder' || archetype === 'dc-series-circuit-kit') && (
        <g>
          <rect x="14" y="34" width="68" height="38" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.8" />
          {/* Slot 1 battery */}
          <rect x="20" y="39" width="52" height="12" rx="3" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
          <rect x="28" y="39" width="36" height="12" fill="#F8FAFC" />
          <rect x="72" y="42" width="4" height="6" rx="1" fill="#FBBF24" />
          {/* Slot 2 battery */}
          <rect x="24" y="55" width="52" height="12" rx="3" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
          <rect x="32" y="55" width="36" height="12" fill="#F8FAFC" />
          <rect x="20" y="58" width="4" height="6" rx="1" fill="#FBBF24" />
          {/* 4 corner terminals */}
          <circle cx="17" cy="37" r="4" fill="#EF4444" stroke="#FFF" strokeWidth="1" />
          <circle cx="17" cy="69" r="4" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="79" cy="37" r="4" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="79" cy="69" r="4" fill="#EF4444" stroke="#FFF" strokeWidth="1" />
        </g>
      )}

      {archetype === 'dc-con-o-battery' && (
        <g>
          <rect x="18" y="36" width="54" height="24" rx="5" fill="#E11D48" stroke="#9F1239" strokeWidth="1.6" />
          <rect x="28" y="36" width="34" height="24" fill="#FFFFFF" />
          <rect x="72" y="43" width="6" height="10" rx="1.5" fill="url(#brassGrad)" stroke="#92400E" strokeWidth="1" />
          <text x="45" y="51" fill="#B91C1C" fontSize="8.5" fontWeight="bold" textAnchor="middle">
            1.5V
          </text>
        </g>
      )}

      {archetype === 'dc-knife-switch' && (
        <g>
          <rect x="18" y="56" width="60" height="16" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.6" />
          <circle cx="28" cy="64" r="4.5" fill="#EF4444" stroke="#FFF" strokeWidth="1" />
          <circle cx="68" cy="64" r="4.5" fill="#22C55E" stroke="#FFF" strokeWidth="1" />
          <rect x="34" y="46" width="6" height="12" fill="url(#brassGrad)" />
          <rect x="56" y="46" width="6" height="12" fill="url(#brassGrad)" />
          <line x1="37" y1="48" x2="62" y2="30" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
          <rect x="58" y="23" width="14" height="8" rx="3" transform="rotate(-35 65 27)" fill="#DC2626" />
        </g>
      )}

      {archetype === 'dc-light-bulb-126' && (
        <g>
          <rect x="20" y="58" width="56" height="14" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.6" />
          <circle cx="28" cy="65" r="4.5" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="68" cy="65" r="4.5" fill="#EF4444" stroke="#FFF" strokeWidth="1" />
          <rect x="41" y="46" width="14" height="12" rx="1.5" fill="url(#brassGrad)" stroke="#92400E" strokeWidth="1.2" />
          <circle cx="48" cy="34" r="14" fill="#FEF08A" fillOpacity="0.85" stroke="#F59E0B" strokeWidth="1.8" />
          <path d="M43 44 L45 33 L51 33 L53 44" stroke="#EA580C" strokeWidth="1.8" fill="none" />
        </g>
      )}

      {archetype === 'dc-rheostat-20' && (
        <g>
          <rect x="14" y="64" width="68" height="8" rx="2" fill="#1E293B" />
          <rect x="18" y="34" width="8" height="30" rx="1.5" fill="#334155" />
          <rect x="70" y="34" width="8" height="30" rx="1.5" fill="#334155" />
          <rect x="24" y="43" width="48" height="16" rx="2" fill="#44403C" stroke="#78716C" strokeWidth="1.4" />
          {[28, 33, 38, 43, 48, 53, 58, 63, 68].map((x) => (
            <line key={x} x1={x} y1="43" x2={x} y2="59" stroke="#D97706" strokeWidth="1.4" />
          ))}
          <line x1="18" y1="30" x2="78" y2="30" stroke="#CBD5E1" strokeWidth="3.5" />
          <rect x="42" y="22" width="14" height="12" rx="2.5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.4" />
          <circle cx="22" cy="66" r="4" fill="#EF4444" stroke="#FFF" strokeWidth="1" />
          <circle cx="74" cy="66" r="4" fill="#22C55E" stroke="#FFF" strokeWidth="1" />
          <circle cx="78" cy="30" r="4" fill="#22C55E" stroke="#FFF" strokeWidth="1" />
        </g>
      )}

      {(archetype === 'dc-ammeter' || archetype === 'dc-voltmeter') && (
        <g>
          <rect x="20" y="16" width="56" height="60" rx="5" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.8" />
          <rect x="26" y="22" width="44" height="30" rx="2.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />
          <path d="M31 46 A19 19 0 0 1 65 46" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <line x1="48" y1="48" x2="55" y2="28" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
          <text
            x="48"
            y="43"
            fill={archetype === 'dc-ammeter' ? '#15803D' : '#1D4ED8'}
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            {archetype === 'dc-ammeter' ? 'A' : 'V'}
          </text>
          <rect
            x="24"
            y="56"
            width="48"
            height="14"
            rx="2.5"
            fill={archetype === 'dc-ammeter' ? '#16A34A' : '#2563EB'}
          />
          <circle cx="32" cy="63" r="4" fill="#0F172A" stroke="#FFF" strokeWidth="1" />
          <circle cx="48" cy="63" r="4" fill="#EF4444" stroke="#FFF" strokeWidth="1" />
          <circle cx="64" cy="63" r="4" fill="#EF4444" stroke="#FFF" strokeWidth="1" />
        </g>
      )}

      {archetype === 'pascal-hydraulic-press' && (
        <g>
          {/* Heavy dark slate base plinth */}
          <rect x="10" y="72" width="76" height="7" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1.4" />
          {/* Horizontal connecting glass tube at bottom */}
          <rect x="26" y="61" width="44" height="7" fill="url(#waterGrad)" stroke="#38BDF8" strokeWidth="1.2" />
          {/* Brass union collars */}
          <rect x="35" y="60" width="4" height="9" rx="1" fill="url(#brassGrad)" />
          <rect x="46" y="60" width="4" height="9" rx="1" fill="url(#brassGrad)" />
          <rect x="57" y="60" width="4" height="9" rx="1" fill="url(#brassGrad)" />
          {/* Left Large Cylinder S1 = 2*S2 */}
          <rect x="14" y="22" width="24" height="50" rx="2" fill="url(#glassGrad)" stroke="#0284C7" strokeWidth="1.6" />
          <rect x="15.5" y="42" width="21" height="29" fill="url(#waterGrad)" />
          {/* Right Small Cylinder S2 */}
          <rect x="60" y="22" width="16" height="50" rx="2" fill="url(#glassGrad)" stroke="#0284C7" strokeWidth="1.6" />
          <rect x="61.5" y="42" width="13" height="29" fill="url(#waterGrad)" />
          {/* Equilibrium h0 reference dashed line */}
          <line x1="12" y1="42" x2="80" y2="42" stroke="#00BCEB" strokeWidth="1.3" strokeDasharray="3 2" />
          {/* Piston 1 (Left S1) */}
          <rect x="15.5" y="37" width="21" height="5" rx="1" fill="#334155" stroke="#0F172A" strokeWidth="1" />
          <line x1="26" y1="18" x2="26" y2="37" stroke="#94A3B8" strokeWidth="3" />
          <rect x="16" y="16" width="20" height="3" rx="1" fill="url(#metalGrad)" stroke="#475569" strokeWidth="1" />
          {/* 2 Weights on Piston 1 */}
          <rect x="20" y="10" width="12" height="6" rx="1" fill="url(#brassGrad)" stroke="#92400E" strokeWidth="1" />
          {/* Piston 2 (Right S2) */}
          <rect x="61.5" y="37" width="13" height="5" rx="1" fill="#334155" stroke="#0F172A" strokeWidth="1" />
          <line x1="68" y1="18" x2="68" y2="37" stroke="#94A3B8" strokeWidth="2.5" />
          <rect x="60" y="16" width="16" height="3" rx="1" fill="url(#metalGrad)" stroke="#475569" strokeWidth="1" />
          {/* 1 Weight on Piston 2 */}
          <rect x="63" y="12" width="10" height="4" rx="1" fill="url(#brassGrad)" stroke="#92400E" strokeWidth="1" />
          {/* Pascal transmission arrows inside fluid */}
          <line x1="26" y1="50" x2="26" y2="62" stroke="#FEF08A" strokeWidth="1.5" />
          <line x1="34" y1="64.5" x2="58" y2="64.5" stroke="#FEF08A" strokeWidth="1.5" />
          <line x1="68" y1="62" x2="68" y2="50" stroke="#FEF08A" strokeWidth="1.5" />
        </g>
      )}

      {archetype === 'pascal-weight-100g' && (
        <g>
          {/* Machined steel & brass 100g = 1.0N weight */}
          <path
            d="M28 38 V70 C28 75 68 75 68 70 V38 Z"
            fill="url(#metalGrad)"
            stroke="#475569"
            strokeWidth="1.8"
          />
          <ellipse
            cx="48"
            cy="38"
            rx="20"
            ry="5.5"
            fill="#FDE68A"
            stroke="#B45309"
            strokeWidth="1.6"
          />
          {/* Top lifting knob */}
          <rect
            x="43"
            y="25"
            width="10"
            height="12"
            rx="2"
            fill="url(#metalGrad)"
            stroke="#475569"
            strokeWidth="1.4"
          />
          <circle
            cx="48"
            cy="23"
            r="5.5"
            fill="#F8FAFC"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Stamped label */}
          <rect x="33" y="48" width="30" height="16" rx="2.5" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.2" />
          <text
            x="48"
            y="56.5"
            fill="#FBBF24"
            fontSize="7.5"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="middle"
          >
            100g
          </text>
          <text
            x="48"
            y="62.8"
            fill="#38BDF8"
            fontSize="6.5"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="middle"
          >
            1.0 N
          </text>
        </g>
      )}

      {archetype === 'reagent-bottle-naoh-400' && (
        <g>
          {/* Schott Duran 400ml Clear Glass Bottle with Blue GL45 Ribbed Screw Cap */}
          <path
            d="M36 24 H60 V29 C65 33 69 38 69 44 V74 C69 78 65 80 60 80 H36 C31 80 27 78 27 74 V44 C27 38 31 33 36 29 Z"
            fill="url(#glassGrad)"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          {/* 300ml NaOH 0.1M colorless solution inside */}
          <path
            d="M29 48 H67 V73.5 C67 76.5 64 78 59 78 H37 C32 78 29 76.5 29 73.5 Z"
            fill="rgba(224,242,254,0.65)"
          />
          <ellipse cx="48" cy="48" rx="19" ry="2.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.3" />
          {/* Blue GL45 Ribbed Screw Cap */}
          <rect x="35" y="13" width="26" height="11" rx="2.5" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="1.4" />
          <rect x="34" y="23" width="28" height="2.8" rx="1" fill="#1E40AF" />
          {[38, 42, 46, 50, 54, 58].map((rx) => (
            <line key={rx} x1={rx} y1="14.5" x2={rx} y2="22.5" stroke="#60A5FA" strokeWidth="1.1" />
          ))}
          {/* Cream Label: NaOH 0,1M */}
          <rect x="31" y="51" width="26" height="19" rx="2.5" fill="#F8F5EB" stroke="#334155" strokeWidth="1.2" />
          <rect x="32.5" y="52.5" width="23" height="3.5" fill="#1D4ED8" />
          <text x="44" y="62.5" fill="#0F172A" fontSize="7.2" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            NaOH
          </text>
          <text x="44" y="68" fill="#0284C7" fontSize="5.8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            0,1M•300ml
          </text>
          {/* Right volume scale ticks (100..400ml) */}
          <line x1="60" y1="42" x2="65" y2="42" stroke="#334155" strokeWidth="1.2" />
          <line x1="60" y1="48" x2="66" y2="48" stroke="#0284C7" strokeWidth="1.8" />
          <line x1="60" y1="56" x2="65" y2="56" stroke="#334155" strokeWidth="1.2" />
          <line x1="60" y1="64" x2="65" y2="64" stroke="#334155" strokeWidth="1.2" />
        </g>
      )}

      {archetype === 'copper-wire-ring-3g' && (
        <g>
          {/* Pure Copper Wire Ring (Cu - 3.00g) with knotted hook at top-left */}
          <ellipse
            cx="48"
            cy="54"
            rx="26"
            ry="18"
            fill="none"
            stroke="#9A3412"
            strokeWidth="7.5"
          />
          <ellipse
            cx="48"
            cy="54"
            rx="26"
            ry="18"
            fill="none"
            stroke="#D98A6C"
            strokeWidth="5.2"
          />
          <ellipse
            cx="47"
            cy="53"
            rx="25.5"
            ry="17.5"
            fill="none"
            stroke="#FDBA74"
            strokeWidth="1.5"
            strokeDasharray="18 12"
          />
          {/* Top-left twisted hook knot (11 o'clock) */}
          <path
            d="M27 42 C29 36 36 35 40 39 C43 42 36 46 31 44"
            fill="none"
            stroke="#9A3412"
            strokeWidth="6.2"
            strokeLinecap="round"
          />
          <path
            d="M27 42 C29 36 36 35 40 39 C43 42 36 46 31 44"
            fill="none"
            stroke="#EA580C"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          {/* Badge Cu 3,00g */}
          <rect x="33" y="47" width="30" height="14" rx="3" fill="#0F172A" stroke="#F97316" strokeWidth="1.2" />
          <text x="48" y="56.5" fill="#FDBA74" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            Cu 3,00g
          </text>
        </g>
      )}

      {archetype === 'reagent-bottle-agno3-400' && (
        <g>
          {/* Schott Duran 400ml Amber Glass Bottle with Blue GL45 Ribbed Screw Cap */}
          <path
            d="M36 24 H60 V29 C65 33 69 38 69 44 V74 C69 78 65 80 60 80 H36 C31 80 27 78 27 74 V44 C27 38 31 33 36 29 Z"
            fill="rgba(140,59,8,0.82)"
            stroke="#451A03"
            strokeWidth="1.8"
          />
          {/* Amber glass vertical highlight */}
          <path
            d="M31 43 V73"
            stroke="rgba(254,243,199,0.55)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* 300ml AgNO3 level meniscus ring visible inside amber bottle */}
          <ellipse cx="48" cy="48" rx="18.5" ry="2.4" fill="rgba(255,255,255,0.45)" stroke="#FDE047" strokeWidth="1.5" />
          {/* Blue GL45 Ribbed Screw Cap */}
          <rect x="35" y="13" width="26" height="11" rx="2.5" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="1.4" />
          <rect x="34" y="23" width="28" height="2.8" rx="1" fill="#1E40AF" />
          {[38, 42, 46, 50, 54, 58].map((rx) => (
            <line key={rx} x1={rx} y1="14.5" x2={rx} y2="22.5" stroke="#60A5FA" strokeWidth="1.1" />
          ))}
          {/* White Chemical Label: AgNO3 0,1M */}
          <rect x="31" y="51" width="26" height="19" rx="2.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.2" />
          <rect x="32.5" y="52.5" width="23" height="3.5" fill="#0F172A" />
          <text x="44" y="62.5" fill="#0F172A" fontSize="6.8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            AgNO₃
          </text>
          <text x="44" y="68" fill="#B45309" fontSize="5.8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            0,1M•300ml
          </text>
          {/* Right white/gold scale ticks (100..400ml) */}
          <line x1="60" y1="42" x2="65" y2="42" stroke="#FFFFFF" strokeWidth="1.2" />
          <line x1="60" y1="48" x2="66" y2="48" stroke="#FDE047" strokeWidth="1.8" />
          <line x1="60" y1="56" x2="65" y2="56" stroke="#FFFFFF" strokeWidth="1.2" />
          <line x1="60" y1="64" x2="65" y2="64" stroke="#FFFFFF" strokeWidth="1.2" />
        </g>
      )}

      {archetype === 'beaker-bomex-100' && (
        <g>
          {/* 100ml BOMEX Low-Form Glass Beaker with Rolled Rim, V-Spout, Frosted Patch & 20-80ml APPROX. */}
          {/* Liquid inside */}
          <path
            d="M27 52 H69 V75 C69 77.5 67 79 64 79 H32 C29 79 27 77.5 27 75 Z"
            fill="rgba(56,189,248,0.34)"
          />
          <ellipse cx="48" cy="52" rx="21" ry="2.2" fill="rgba(125,211,252,0.65)" />
          {/* Thick Borosilicate glass cylinder body + V-shaped pouring spout on right rim */}
          <path
            d="M23 23 H71 L76 20 L71 26 V75 C71 78.5 68.5 81 65 81 H31 C27.5 81 25 78.5 25 75 V25 Z"
            fill="rgba(255,255,255,0.16)"
            stroke="#94A3B8"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          {/* Rolled rim top highlight */}
          <ellipse cx="48" cy="23" rx="23.5" ry="2.4" fill="none" stroke="#E2E8F0" strokeWidth="1.6" />
          {/* Left column: Circular 2-droplet Logo -> BOMEX -> 100 ml -> White Frosted Patch */}
          <circle cx="38" cy="33" r="4.8" fill="none" stroke="#FFFFFF" strokeWidth="1.3" />
          <circle cx="37" cy="33.5" r="1.4" fill="#FFFFFF" />
          <circle cx="39.5" cy="32.5" r="1.0" fill="#FFFFFF" />
          <text x="38" y="42.5" fill="#FFFFFF" fontSize="5.2" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            BOMEX
          </text>
          <text x="38" y="49.5" fill="#FFFFFF" fontSize="6.6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            100 ml
          </text>
          {/* Opaque White Frosted Rectangular Patch below 100 ml */}
          <rect x="30" y="52.5" width="16" height="20" rx="1.5" fill="rgba(255,255,255,0.92)" stroke="#E2E8F0" strokeWidth="0.9" />
          {/* Right column: Graduation lines 20, 40, 60, 80 ml + APPROX. */}
          <line x1="51" y1="35" x2="51" y2="71" stroke="#FFFFFF" strokeWidth="1.1" />
          <line x1="51" y1="35" x2="57" y2="35" stroke="#FFFFFF" strokeWidth="1.4" />
          <text x="58.5" y="36" fill="#FFFFFF" fontSize="4.6" fontWeight="bold" fontFamily="sans-serif">
            80 ml
          </text>
          <text x="58.5" y="40.2" fill="#E2E8F0" fontSize="3.3" fontWeight="bold" fontFamily="sans-serif">
            APPROX.
          </text>
          <line x1="51" y1="47" x2="56.5" y2="47" stroke="#FFFFFF" strokeWidth="1.3" />
          <text x="58.5" y="48.5" fill="#FFFFFF" fontSize="4.6" fontWeight="bold" fontFamily="sans-serif">
            60
          </text>
          <line x1="51" y1="59" x2="56.5" y2="59" stroke="#FFFFFF" strokeWidth="1.3" />
          <text x="58.5" y="60.5" fill="#FFFFFF" fontSize="4.6" fontWeight="bold" fontFamily="sans-serif">
            40
          </text>
          <line x1="51" y1="71" x2="56.5" y2="71" stroke="#FFFFFF" strokeWidth="1.3" />
          <text x="58.5" y="72.5" fill="#FFFFFF" fontSize="4.6" fontWeight="bold" fontFamily="sans-serif">
            20
          </text>
        </g>
      )}

      {archetype === 'color-filter-dispersion' && (
        <g>
          {/* Optical rail base */}
          <rect x="10" y="74" width="76" height="8" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          {/* White light projector lamp (left) */}
          <rect x="12" y="42" width="16" height="12" rx="2" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="20" y1="54" x2="20" y2="74" stroke="#CBD5E1" strokeWidth="2.4" />
          {/* White incident light beam */}
          <line x1="28" y1="48" x2="43" y2="48" stroke="#FFFBEB" strokeWidth="3.2" strokeLinecap="round" />
          {/* Flint glass equilateral prism */}
          <polygon
            points="48,30 37,56 59,56"
            fill="rgba(186,230,253,0.48)"
            stroke="#38BDF8"
            strokeWidth="1.8"
          />
          <rect x="42" y="56" width="12" height="18" rx="1" fill="#D4A017" />
          {/* Dispersed 7-color rainbow rays */}
          <line x1="53" y1="45" x2="80" y2="33" stroke="#EF4444" strokeWidth="2" />
          <line x1="54" y1="46.5" x2="80" y2="38" stroke="#F97316" strokeWidth="1.8" />
          <line x1="54" y1="48" x2="80" y2="43" stroke="#FACC15" strokeWidth="1.8" />
          <line x1="55" y1="49" x2="80" y2="48" stroke="#22C55E" strokeWidth="1.8" />
          <line x1="54" y1="50.5" x2="80" y2="53" stroke="#06B6D4" strokeWidth="1.8" />
          <line x1="54" y1="52" x2="80" y2="58" stroke="#3B82F6" strokeWidth="1.8" />
          <line x1="53" y1="53.5" x2="80" y2="63" stroke="#A855F7" strokeWidth="2" />
          {/* Color filter frame */}
          <rect x="64" y="30" width="5" height="36" rx="1.2" fill="rgba(239,68,68,0.45)" stroke="#F87171" strokeWidth="1.4" />
          <line x1="66.5" y1="66" x2="66.5" y2="74" stroke="#CBD5E1" strokeWidth="2" />
          {/* Observation screen (right) */}
          <rect x="79" y="26" width="6" height="44" rx="1.5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.4" />
        </g>
      )}

      {archetype === 'oxygen-air-volume' && (
        <g>
          {/* Base plate */}
          <rect x="12" y="78" width="72" height="6" rx="2" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
          {/* Glass water trough */}
          <path
            d="M18 54 L20 77 L74 77 L76 54"
            fill="rgba(186,230,253,0.22)"
            stroke="#94A3B8"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Indicator blue water inside trough */}
          <rect x="20.5" y="63" width="53" height="13.5" rx="1" fill="rgba(14,165,233,0.48)" />
          {/* Graduated bell tube (0-5 marks) */}
          <path
            d="M34 69 L34 22 Q34 17 39 17 L55 17 Q60 17 60 22 L60 69"
            fill="rgba(224,242,254,0.2)"
            stroke="#38BDF8"
            strokeWidth="1.6"
          />
          {/* Rubber stopper on top */}
          <rect x="42" y="12" width="10" height="5" rx="1.2" fill="#475569" />
          {/* Rising water column up to mark 1 (~21%) */}
          <rect x="35.2" y="54" width="23.6" height="15" fill="rgba(14,165,233,0.72)" />
          <line x1="35.2" y1="54" x2="58.8" y2="54" stroke="#7DD3FC" strokeWidth="1.6" />
          {/* 5 graduation marks (1..5) */}
          <line x1="34" y1="55" x2="43" y2="55" stroke="#FBBF24" strokeWidth="1.8" />
          <line x1="34" y1="46" x2="41" y2="46" stroke="#E2E8F0" strokeWidth="1.2" />
          <line x1="34" y1="37" x2="41" y2="37" stroke="#E2E8F0" strokeWidth="1.2" />
          <line x1="34" y1="28" x2="41" y2="28" stroke="#E2E8F0" strokeWidth="1.2" />
          {/* Candle pedestal & flame */}
          <rect x="44" y="58" width="6" height="18" rx="1" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.9" />
          <rect x="45" y="48" width="4" height="11" rx="0.8" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.8" />
          <path d="M47 36 Q51 43 47 47 Q43 43 47 36 Z" fill="#F97316" />
          <path d="M47 40 Q49 44 47 46.5 Q45 44 47 40 Z" fill="#FEF08A" />
          {/* O2 badge */}
          <text x="64" y="31" fill="#F87171" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">
            O₂
          </text>
          <text x="63" y="40" fill="#FBBF24" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
            ≈21%
          </text>
        </g>
      )}
    </svg>
  );
};
