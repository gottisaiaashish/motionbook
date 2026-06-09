const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/LandingPage.jsx', 'utf8');
content = content.replace(/"use client";\n/g, '');
content = content.replace(/import Link from "next\/link";/g, 'import { Link } from "react-router-dom";');
content = content.replace(/@\/components\/Hyperspeed/g, './Hyperspeed');
content = content.replace(/href=/g, 'to=');
fs.writeFileSync('frontend/src/components/LandingPage.jsx', content, 'utf8');
