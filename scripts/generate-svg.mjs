#!/usr/bin/env node
import fs from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { T, estimateTextWidth, sizeContainer } from "./tokens.js";
import { MOTIFS, MOTIF_NAMES } from "./motifs.js";

const P = {
  dreamlight:{s:["#080B18","#1B2140"],i:"#fff",m:"#B8C2D9",a:"#8BE9FF",a2:"#8b7cf6",sh:"#8b7cf6",g:"#8BE9FF",d:1},
  editorial:{s:["#F6F1E8","#EDE6D6"],i:"#111",m:"#555",a:"#5649c2",a2:"#7c6ee0",sh:"#64748b",g:"#a78bfa",d:0},
  glass:{s:["#111827","#030712"],i:"#fff",m:"#94A3B8",a:"#7DD3FC",a2:"#a78bfa",sh:"#1e293b",g:"#7DD3FC",d:1},
  mono:{s:["#1a1a2e","#16213e"],i:"#e6e6e6",m:"#a0a0b0",a:"#0ea5e9",a2:"#0ea5e9",sh:"#000",g:"#0ea5e9",d:1},
  earth:{s:["#fff8ec","#ffedd5"],i:"#4a3826",m:"#63503b",a:"#f59e0b",a2:"#fb923c",sh:"#92400e",g:"#fbbf24",d:0},
  brand:{s:["#eef4ff","#f6efff"],i:"#2b2f55",m:"#5a608f",a:"#8b7cf6",a2:"#38bdf8",sh:"#7c74e8",g:"#8b7cf6",d:0},
};
// Per-card accent overrides for gallery variety
const CARD_ACCENTS = [
  {a:"#8b7cf6",a2:"#38bdf8"}, {a:"#38bdf8",a2:"#8b7cf6"}, {a:"#f472b6",a2:"#8b7cf6"},
  {a:"#34d399",a2:"#38bdf8"}, {a:"#fbbf24",a2:"#f472b6"}, {a:"#a78bfa",a2:"#34d399"},
  {a:"#60a5fa",a2:"#a78bfa"}, {a:"#fb923c",a2:"#34d399"},
];
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const fst = cjk => cjk ? T.fontStack.cjkSans : T.fontStack.latinSans;
const gD = (id,st,dir="v") => {const a=dir==="v"?'x1="0" y1="0" x2="0" y2="1"':'x1="0" y1="0" x2="1" y2="1"';const ss=st.map((s,i)=>{const o=s.o??(i/(st.length-1));let r='<stop offset="'+o+'" stop-color="'+s.c+'"';if(s.p!=null)r+=' stop-opacity="'+s.p+'"';return r+"/>";}).join("");return '<linearGradient id="'+id+'" '+a+'>'+ss+'</linearGradient>';};
const rD = (id,c,o=0.4) => `<radialGradient id="${id}" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
const sD = (id,c,o=0.2,dy=10,b=14) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="${dy}" stdDeviation="${b}" flood-color="${c}" flood-opacity="${o}"/></filter>`;
const stk = T.stroke.medium;
