// Hand-drawn SVG artwork for the role page: the two card scenes and the campus around them.

const SKIN = '#f4c9a3'
const HAIR = '#2a2131'

const Leaf = ({ x, y, r = 0, s = 1, fill }) => (
  <path d="M0 0C8-9 22-9 30 0C22 9 8 9 0 0Z" fill={fill} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} />
)

const Tree = ({ x, y, s = 1, tones = ['#7cc35a', '#5fae49', '#9bd46d'] }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-5 0L-3-70Q-14-84-26-88M-3-62Q8-80 22-86" stroke="#8a6248" strokeWidth="7" fill="none" strokeLinecap="round" />
    <circle cx="-26" cy="-100" r="30" fill={tones[1]} />
    <circle cx="24" cy="-104" r="32" fill={tones[1]} />
    <circle cx="0" cy="-128" r="36" fill={tones[0]} />
    <circle cx="-32" cy="-128" r="22" fill={tones[0]} />
    <circle cx="30" cy="-134" r="24" fill={tones[2]} />
    <circle cx="4" cy="-150" r="20" fill={tones[2]} />
  </g>
)

export function StudentArt() {
  return (
    <svg viewBox="0 0 520 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g fill="#e1eefc" stroke="#cbe0f6" strokeWidth="5">
        <path d="M24 200V96a68 68 0 0 1 136 0v104" />
        <path d="M392 200V112a62 62 0 0 1 124 0v88" />
      </g>
      <path d="M92 30v170M24 112h136M454 52v148M392 124h124" stroke="#cbe0f6" strokeWidth="5" />
      <path d="M378 52a14 14 0 0 1 26-6 11 11 0 0 1 18 9h-44z" fill="#d7e8fa" />
      <path d="M160 38h8M164 34v8M440 160h6M443 157v6" stroke="#b9d5f4" strokeWidth="2.5" strokeLinecap="round" />

      <g>
        <rect x="26" y="178" width="96" height="16" rx="3" fill="#4d7fe2" /><rect x="30" y="181" width="84" height="4" rx="2" fill="#e9f1ff" />
        <rect x="34" y="162" width="88" height="16" rx="3" fill="#36b0a0" /><rect x="40" y="165" width="76" height="4" rx="2" fill="#e5fbf7" />
        <rect x="22" y="146" width="94" height="16" rx="3" fill="#5dbb63" /><rect x="26" y="149" width="82" height="4" rx="2" fill="#effbea" />
        <rect x="32" y="130" width="84" height="16" rx="3" fill="#8a6fe0" /><rect x="36" y="133" width="72" height="4" rx="2" fill="#f1ecff" />
      </g>

      <rect x="168" y="118" width="54" height="84" rx="18" fill="#2f3d55" />
      <path d="M176 202c2-50 24-78 69-80 45 2 67 30 71 80z" fill="#9fd0f5" />
      <ellipse cx="245" cy="124" rx="34" ry="11" fill="#7cb9ea" />
      <path d="M203 140l8 62" stroke="#2f3d55" strokeWidth="9" strokeLinecap="round" />
      <rect x="235" y="98" width="20" height="26" rx="6" fill="#e6b38f" />
      <path d="M219 118a26 16 0 0 0 52 0" stroke="#2b3a67" strokeWidth="6" fill="none" />
      <circle cx="217" cy="118" r="9" fill="#3d6fdb" /><circle cx="273" cy="118" r="9" fill="#3d6fdb" />

      <circle cx="216" cy="76" r="6" fill="#e6b38f" /><circle cx="274" cy="76" r="6" fill="#e6b38f" />
      <ellipse cx="245" cy="72" rx="29" ry="33" fill={SKIN} />
      <g fill={HAIR}>
        <circle cx="222" cy="54" r="13" /><circle cx="232" cy="41" r="14" /><circle cx="248" cy="35" r="15" />
        <circle cx="264" cy="41" r="13" /><circle cx="274" cy="55" r="11" /><circle cx="215" cy="66" r="8" />
        <circle cx="240" cy="48" r="10" /><circle cx="256" cy="50" r="9" /><circle cx="277" cy="66" r="7" />
        <circle cx="228" cy="30" r="7" /><circle cx="262" cy="27" r="8" />
      </g>
      <path d="M229 68q5-4 10 0M251 68q5-4 10 0" stroke={HAIR} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="234" cy="77" rx="2.8" ry="3.6" fill={HAIR} /><ellipse cx="256" cy="77" rx="2.8" ry="3.6" fill={HAIR} />
      <circle cx="228" cy="88" r="5" fill="#f3a6a0" opacity=".5" /><circle cx="262" cy="88" r="5" fill="#f3a6a0" opacity=".5" />
      <path d="M237 90q8 8 16 0" stroke="#a5523f" strokeWidth="2.6" fill="none" strokeLinecap="round" />

      <path d="M292 146c10 18 20 26 38 28" stroke="#8fc6f1" strokeWidth="22" fill="none" strokeLinecap="round" />
      <circle cx="334" cy="174" r="9" fill={SKIN} />
      <path d="M326 112l94-8 9 74-94 7z" fill="#6c7484" />
      <path d="M333 118l80-7 7 62-80 6z" fill="#7d8595" />
      <path d="M300 186l140-9 7 9-141 9z" fill="#596070" />
      <path d="M362 142l14-7 14 7-14 7z M369 146v6c4 3 10 3 14 0v-6" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function TeacherArt() {
  return (
    <svg viewBox="0 0 520 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <path d="M70 40l9 15H61z" fill="none" stroke="#cdb7f2" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="470" cy="40" r="5" fill="#dccdf7" />
      <path d="M138 118l-12 60M232 118l12 60" stroke="#cbb6f1" strokeWidth="5" strokeLinecap="round" />
      <rect x="112" y="16" width="146" height="104" rx="6" fill="#fff" stroke="#cbb6f1" strokeWidth="5" />
      <rect x="104" y="10" width="162" height="9" rx="4.5" fill="#a98be6" />
      <circle cx="140" cy="50" r="9" fill="#b79bef" /><path d="M136 50l3 3 5-6" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="140" cy="82" r="9" fill="#b79bef" /><path d="M136 82l3 3 5-6" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="157" y="46" width="76" height="7" rx="3.5" fill="#e3d7f9" /><rect x="157" y="78" width="60" height="7" rx="3.5" fill="#e3d7f9" />

      <g>
        <Leaf x={60} y={160} r={-110} s={1.3} fill="#5fb05a" /><Leaf x={60} y={160} r={-70} s={1.4} fill="#7cc66b" />
        <Leaf x={60} y={160} r={-145} s={1.1} fill="#7cc66b" /><Leaf x={60} y={160} r={-35} s={1.1} fill="#5fb05a" />
        <Leaf x={60} y={160} r={-90} s={1.6} fill="#4e9f4c" />
        <path d="M40 158h42l-6 40H46z" fill="#e5d9f7" />
      </g>

      <rect x="150" y="186" width="320" height="14" rx="4" fill="#e6dbf8" />
      <ellipse cx="342" cy="78" rx="38" ry="46" fill={HAIR} />
      <circle cx="362" cy="28" r="15" fill={HAIR} />
      <path d="M280 200c4-48 25-72 62-74 37 2 58 26 62 74z" fill="#8b4fd6" />
      <path d="M327 128l15 40 15-40z" fill="#fff" />
      <path d="M322 130l20 46-12-4-14-36zM362 130l-20 46 12-4 14-36z" fill="#7340bd" />
      <rect x="332" y="98" width="20" height="30" rx="6" fill="#e6b38f" />
      <ellipse cx="342" cy="78" rx="27" ry="31" fill={SKIN} />
      <path d="M314 76c0-24 14-36 30-36 20 0 30 14 28 34-10-2-22-10-28-22-6 12-16 20-30 24z" fill={HAIR} />
      <g stroke={HAIR} strokeWidth="2.4" fill="#ffffff55"><circle cx="331" cy="82" r="8.5" /><circle cx="354" cy="82" r="8.5" /><path d="M339.5 82h6" fill="none" /></g>
      <ellipse cx="331" cy="83" rx="2.5" ry="3.2" fill={HAIR} /><ellipse cx="354" cy="83" rx="2.5" ry="3.2" fill={HAIR} />
      <circle cx="326" cy="96" r="4.5" fill="#f3a6a0" opacity=".5" /><circle cx="359" cy="96" r="4.5" fill="#f3a6a0" opacity=".5" />
      <path d="M335 98q7 6 14 0" stroke="#a5523f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M296 150c-8 18-14 26-26 30" stroke="#7a45c8" strokeWidth="20" fill="none" strokeLinecap="round" />
      <circle cx="266" cy="181" r="8" fill={SKIN} />

      <path d="M186 118l86-4 6 68-86 4z" fill="#6c7484" />
      <circle cx="233" cy="150" r="6" fill="#8b93a3" />
      <path d="M170 188l124-5 4 6-125 6z" fill="#596070" />

      <g>
        <Leaf x={458} y={150} r={-100} s={1.8} fill="#4e9f4c" /><Leaf x={458} y={150} r={-65} s={1.6} fill="#7cc66b" />
        <Leaf x={458} y={150} r={-130} s={1.4} fill="#5fb05a" /><Leaf x={458} y={150} r={-40} s={1.2} fill="#5fb05a" />
        <path d="M442 148h34l-5 26h-24z" fill="#ddd0f6" />
      </g>
      <rect x="410" y="174" width="96" height="12" rx="3" fill="#6d55d6" /><rect x="416" y="162" width="86" height="12" rx="3" fill="#36b0a0" />
      <rect x="406" y="186" width="104" height="12" rx="3" fill="#9a7be6" />
    </svg>
  )
}

export function Scenery() {
  return (
    <div className="scenery" aria-hidden="true">
      <svg className="sc-hills" viewBox="0 0 1600 320" preserveAspectRatio="none">
        <path d="M0 150C260 60 480 120 760 90s560-70 840 30v200H0z" fill="#e3f1e6" />
        <path d="M0 210C320 150 620 200 900 180s520-40 700 10v130H0z" fill="#d3ebd6" />
        <path d="M0 260c400-40 1000-40 1600 0v60H0z" fill="#c6e4c4" />
        <path d="M640 320c60-50 120-70 160-70s100 20 160 70z" fill="#eef4ef" />
      </svg>

      <svg className="sc-left" viewBox="0 0 360 460">
        <g transform="translate(40 60)">
          <rect x="70" y="40" width="74" height="300" fill="#f2d9d2" />
          <path d="M60 44l47-46 47 46z" fill="#e2b8ad" />
          <circle cx="107" cy="78" r="22" fill="#fff" stroke="#d6aea3" strokeWidth="5" />
          <path d="M107 66v12l8 6" stroke="#6b4b45" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="0" y="170" width="280" height="170" fill="#f6e2dc" />
          <path d="M-10 172h300l-12-22H2z" fill="#e2b8ad" />
          {[18, 66, 190, 238].map((x) => [196, 254].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="30" height="40" rx="3" fill="#cfe2f3" stroke="#fff" strokeWidth="3" />))}
          {[86, 114].map((y) => <rect key={y} x="92" y={y} width="30" height="20" rx="2" fill="#cfe2f3" />)}
          <path d="M88 340v-70a19 19 0 0 1 38 0v70z" fill="#bfd6ea" stroke="#fff" strokeWidth="3" />
          <rect x="-10" y="332" width="300" height="10" fill="#e9d0c8" />
        </g>
        <Tree x={40} y={430} s={1.15} />
        <Tree x={330} y={440} s={0.9} tones={['#8ccd63', '#6bb752', '#a8dc78']} />
        <ellipse cx="190" cy="440" rx="120" ry="22" fill="#9fd07c" />
      </svg>

      <svg className="sc-right" viewBox="0 0 360 460">
        <rect x="150" y="250" width="220" height="140" fill="#eef3f6" />
        {[170, 214, 258, 302].map((x) => <rect key={x} x={x} y="280" width="26" height="34" rx="3" fill="#dbe8f2" />)}
        <Tree x={120} y={440} s={1.35} />
        <Tree x={300} y={440} s={1.1} tones={['#8ccd63', '#6bb752', '#a8dc78']} />
        <ellipse cx="200" cy="445" rx="160" ry="22" fill="#9fd07c" />
      </svg>

      <svg className="sc-branch" viewBox="0 0 260 300">
        <path d="M-10 40C60 60 110 90 150 150S200 250 210 300M60 66C80 30 110 12 150 8M120 120c30-20 70-26 110-20" stroke="#7a6a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
        {[[30, 50, 20], [55, 62, 70], [70, 45, -40], [90, 30, -20], [112, 18, 10], [134, 10, -10], [100, 90, 60], [120, 108, -30], [140, 125, 80], [150, 150, -10], [160, 112, -40], [190, 104, 10], [214, 100, -20], [166, 180, 60], [175, 210, 0], [190, 240, 70]].map(([x, y, r], i) => (
          <Leaf key={i} x={x} y={y} r={r} s={1.35} fill={i % 3 ? '#7cc35a' : '#a3d86e'} />
        ))}
      </svg>

      <svg className="sc-bush sc-bush-l" viewBox="0 0 240 160">
        {[[20, 160, -70], [40, 160, -95], [60, 160, -55], [10, 160, -40], [80, 160, -80], [100, 160, -30], [0, 150, -110]].map(([x, y, r], i) => (
          <Leaf key={i} x={x} y={y} r={r} s={3.2} fill={i % 2 ? '#4f9d47' : '#6cb85a'} />
        ))}
      </svg>
      <svg className="sc-bush sc-bush-r" viewBox="0 0 240 160">
        {[[220, 160, -110], [200, 160, -85], [180, 160, -125], [230, 160, -140], [160, 160, -100], [140, 160, -150], [240, 150, -70]].map(([x, y, r], i) => (
          <Leaf key={i} x={x} y={y} r={r} s={3.2} fill={i % 2 ? '#4f9d47' : '#6cb85a'} />
        ))}
      </svg>
    </div>
  )
}
