const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCkkuyfE8AO7K7MLSNArRA82YmhorWPJ_Y",
  authDomain: "iron-rails-classroom.firebaseapp.com",
  databaseURL: "https://iron-rails-classroom-default-rtdb.firebaseio.com",
  projectId: "iron-rails-classroom",
  storageBucket: "iron-rails-classroom.firebasestorage.app",
  messagingSenderId: "733640081725",
  appId: "1:733640081725:web:69ece06019ea894ebe0554"
};

const USERNAMES = [
  "Iron Duke","Coal Baron","Steam King","Rail Lord","Copper Captain",
  "Cinder Jack","Boiler Rex","Track Boss","Smoke Earl","Spike Quinn",
  "Anvil Hayes","Ember Cross","Forge Nash","Clinker Wade","Piston Vale",
  "Trestle Burke","Gauge Flynn","Tender Knox","Whistle Grant","Firebox Rhys"
];

const GOODS_COLORS = ["red","blue","purple","yellow","black"];

const CITY_COLOR_MAP = {
  "Pittsburgh":"red","Cincinnati":"blue","Cleveland":"purple",
  "Detroit":"yellow","Columbus":"black","Indianapolis":"red",
  "Louisville":"blue","Buffalo":"purple","Erie":"yellow","Toledo":"black",
  "Wheeling":"red","Akron":"blue","Dayton":"purple","Lansing":"yellow",
  "Ft Wayne":"black","Youngstown":"red","Canton":"blue","Lima":"purple",
  "Muncie":"yellow","Evansville":"black"
};

const TIER_RULES = {
  1: {
    name:"Local Routes",
    maxShares:2,
    buildTiles:0,
    actions:[],
    prebuilt:true,
    rounds:5,
    startCash:10,
    engineMax:3,
    description:"Pre-built network. Focus on moving goods and managing debt."
  },
  2: {
    name:"Regional Rail",
    maxShares:4,
    buildTiles:2,
    actions:["First Move","First Build","Locomotive"],
    prebuilt:"partial",
    rounds:6,
    startCash:10,
    engineMax:4,
    description:"Extend the network. Compete for routes and invest wisely."
  },
  3: {
    name:"Iron Rails",
    maxShares:6,
    buildTiles:3,
    actions:["First Move","First Build","Locomotive","Engineer","Urbanization"],
    prebuilt:false,
    rounds:7,
    startCash:10,
    engineMax:6,
    description:"Build from scratch. Full strategic depth with all actions."
  }
};

const LINKS_TIER1 = [
  {id:"L1",from:"Pittsburgh",to:"Cleveland",owner:null},
  {id:"L2",from:"Pittsburgh",to:"Wheeling",owner:null},
  {id:"L3",from:"Cleveland",to:"Toledo",owner:null},
  {id:"L4",from:"Cleveland",to:"Akron",owner:null},
  {id:"L5",from:"Cincinnati",to:"Columbus",owner:null},
  {id:"L6",from:"Cincinnati",to:"Dayton",owner:null},
  {id:"L7",from:"Cincinnati",to:"Louisville",owner:null},
  {id:"L8",from:"Columbus",to:"Pittsburgh",owner:null},
  {id:"L9",from:"Detroit",to:"Toledo",owner:null},
  {id:"L10",from:"Detroit",to:"Lansing",owner:null},
  {id:"L11",from:"Indianapolis",to:"Ft Wayne",owner:null},
  {id:"L12",from:"Indianapolis",to:"Muncie",owner:null},
  {id:"L13",from:"Buffalo",to:"Erie",owner:null},
  {id:"L14",from:"Erie",to:"Cleveland",owner:null},
  {id:"L15",from:"Youngstown",to:"Pittsburgh",owner:null},
  {id:"L16",from:"Canton",to:"Akron",owner:null},
  {id:"L17",from:"Lima",to:"Ft Wayne",owner:null},
  {id:"L18",from:"Evansville",to:"Louisville",owner:null}
];

const LINKS_TIER2_STARTER = [
  {id:"L1",from:"Pittsburgh",to:"Cleveland",owner:null},
  {id:"L2",from:"Pittsburgh",to:"Wheeling",owner:null},
  {id:"L3",from:"Cleveland",to:"Toledo",owner:null},
  {id:"L5",from:"Cincinnati",to:"Columbus",owner:null},
  {id:"L7",from:"Cincinnati",to:"Louisville",owner:null},
  {id:"L9",from:"Detroit",to:"Toledo",owner:null},
  {id:"L13",from:"Buffalo",to:"Erie",owner:null},
  {id:"L14",from:"Erie",to:"Cleveland",owner:null}
];

const CITIES = Object.keys(CITY_COLOR_MAP);

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for(let i=0;i<5;i++) code += chars[Math.floor(Math.random()*chars.length)];
  return code;
}

function pickUsername(usedNames) {
  const available = USERNAMES.filter(n => !usedNames.includes(n));
  if(available.length === 0) return "Rail " + Math.floor(Math.random()*999);
  return available[Math.floor(Math.random()*available.length)];
}

function initGoods(tier) {
  const goods = {};
  const cities = Object.entries(CITY_COLOR_MAP);
  cities.forEach(([city, color]) => {
    const count = (city==="Pittsburgh"||city==="Detroit") ? 3 : 2;
    goods[city] = [];
    for(let i=0;i<count;i++) {
      goods[city].push(color);
    }
    const extra = GOODS_COLORS[Math.floor(Math.random()*GOODS_COLORS.length)];
    if(Math.random() > 0.5) goods[city].push(extra);
  });
  return goods;
}

function initLinks(tier) {
  if(tier === 1) return LINKS_TIER1.map(l=>({...l}));
  if(tier === 2) return LINKS_TIER2_STARTER.map(l=>({...l}));
  return [];
}

function initPlayers(playerList, tier) {
  const players = {};
  const colors = ["#E53935","#1E88E5","#43A047","#FB8C00","#8E24AA","#00ACC1"];
  playerList.forEach((p, i) => {
    players[p.id] = {
      id: p.id,
      name: p.name,
      color: colors[i % colors.length],
      cash: TIER_RULES[tier].startCash,
      income: 0,
      shares: 2,
      engineLevel: 1,
      order: i+1,
      action: null,
      vp: 0,
      eliminated: false
    };
  });
  return players;
}

function buildInitialState(roomCode, tier, playerList) {
  const rules = TIER_RULES[tier];
  return {
    roomCode,
    tier,
    phase: "lobby",
    round: 1,
    totalRounds: rules.rounds,
    turnStep: "issue_shares",
    activePlayer: null,
    playerOrder: playerList.map(p=>p.id),
    players: initPlayers(playerList, tier),
    links: initLinks(tier),
    goods: initGoods(tier),
    log: [],
    actionsTaken: {},
    createdAt: Date.now()
  };
}

function calcExpenses(player) {
  return player.shares + player.engineLevel;
}

function calcVP(player, links) {
  const incomeVP = player.income * 3;
  const sharesPenalty = player.shares * 3;
  const trackVP = links.filter(l=>l.owner===player.id).length;
  return incomeVP + trackVP - sharesPenalty;
}

function canMoveGoods(fromCity, toCity, links, engineLevel, players, visitedCities) {
  if(visitedCities.includes(fromCity)) return false;
  const link = links.find(l=>
    (l.from===fromCity && l.to===toCity) ||
    (l.to===fromCity && l.from===toCity)
  );
  return !!link;
}

function findPaths(startCity, goodsColor, links, engineLevel, players, path=[]) {
  if(path.length > engineLevel) return [];
  const results = [];
  const current = path.length===0 ? startCity : path[path.length-1];
  const neighbors = links
    .filter(l=>l.from===current||l.to===current)
    .map(l=>l.from===current?l.to:l.from)
    .filter(c=>!path.includes(c));
  for(const neighbor of neighbors) {
    const newPath = [...path, neighbor];
    if(CITY_COLOR_MAP[neighbor]===goodsColor) {
      results.push(newPath);
    }
    if(newPath.length < engineLevel) {
      results.push(...findPaths(startCity, goodsColor, links, engineLevel, players, newPath));
    }
  }
  return results;
}

function moveGoodsAndScore(state, playerId, fromCity, path) {
  const newState = JSON.parse(JSON.stringify(state));
  const goodsColor = newState.goods[fromCity]?.[0];
  if(!goodsColor) return {error:"No goods in that city"};

  const destCity = path[path.length-1];
  if(CITY_COLOR_MAP[destCity] !== goodsColor) return {error:"Destination color mismatch"};

  newState.goods[fromCity].shift();

  const linksTraversed = [];
  let prev = fromCity;
  for(const city of path) {
    const link = newState.links.find(l=>
      (l.from===prev&&l.to===city)||(l.to===prev&&l.from===city)
    );
    if(link && link.owner) {
      newState.players[link.owner].income += 1;
      linksTraversed.push({link, owner: link.owner});
    }
    prev = city;
  }

  newState.log.unshift({
    type:"move",
    player: playerId,
    playerName: newState.players[playerId].name,
    from: fromCity,
    to: destCity,
    path,
    color: goodsColor,
    timestamp: Date.now()
  });

  return newState;
}

function issueShare(state, playerId) {
  const newState = JSON.parse(JSON.stringify(state));
  const player = newState.players[playerId];
  const maxShares = TIER_RULES[newState.tier].maxShares;
  if(player.shares >= maxShares) return {error:`Max ${maxShares} shares for this tier`};
  player.shares += 1;
  player.cash += 5;
  newState.log.unshift({
    type:"share",
    player:playerId,
    playerName:player.name,
    shares:player.shares,
    timestamp:Date.now()
  });
  return newState;
}

function claimLink(state, playerId, linkId) {
  const newState = JSON.parse(JSON.stringify(state));
  const link = newState.links.find(l=>l.id===linkId);
  if(!link) return {error:"Link not found"};
  if(link.owner) return {error:"Link already owned"};
  const cost = 2;
  const player = newState.players[playerId];
  if(player.cash < cost) return {error:"Not enough cash"};
  player.cash -= cost;
  link.owner = playerId;
  newState.log.unshift({
    type:"build",
    player:playerId,
    playerName:player.name,
    link:linkId,
    from:link.from,
    to:link.to,
    timestamp:Date.now()
  });
  return newState;
}

function collectIncome(state) {
  const newState = JSON.parse(JSON.stringify(state));
  Object.values(newState.players).forEach(p => {
    if(!p.eliminated) p.cash += p.income;
  });
  return newState;
}

function payExpenses(state) {
  const newState = JSON.parse(JSON.stringify(state));
  Object.values(newState.players).forEach(p => {
    if(p.eliminated) return;
    const expenses = calcExpenses(p);
    if(p.cash >= expenses) {
      p.cash -= expenses;
    } else {
      const shortfall = expenses - p.cash;
      p.cash = 0;
      p.income = Math.max(-1, p.income - shortfall);
      if(p.income < 0) {
        p.eliminated = true;
        newState.log.unshift({type:"eliminated",player:p.id,playerName:p.name,timestamp:Date.now()});
      }
    }
  });
  return newState;
}

function computeFinalVP(state) {
  const newState = JSON.parse(JSON.stringify(state));
  Object.values(newState.players).forEach(p => {
    p.vp = calcVP(p, newState.links);
  });
  return newState;
}

window.IronRails = {
  FIREBASE_CONFIG,
  TIER_RULES,
  CITIES,
  CITY_COLOR_MAP,
  GOODS_COLORS,
  generateRoomCode,
  pickUsername,
  buildInitialState,
  issueShare,
  claimLink,
  moveGoodsAndScore,
  collectIncome,
  payExpenses,
  computeFinalVP,
  calcExpenses,
  calcVP,
  findPaths,
  LINKS_TIER1,
  LINKS_TIER2_STARTER
};
