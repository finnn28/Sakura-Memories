window.SAKURA_FILL_STAT_FORMULAS = [
  {
    id: "netral-full-cd",
    title: "Netral with stat Full CD",
    type: "Armor",
    stats: [
      { name: "ATK %", value: 10 },
      { name: "Critical Damage %", value: 10 },
      { name: "Critical Damage", value: 24 },
      { name: "DEX %", value: 10 },
      { name: "MATK %", value: -16 },
      { name: "Accuracy", value: -26 },
      { name: "Magic Pierce %", value: -10 },
      { name: "Accuracy %", value: -7 }
    ],
    originalPotential: 0,
    startingPotential: 66,
    steps: [
      { description: "ATK % +1", repeat: 1 },
      { description: "Critical Damage % +1", repeat: 1 },
      { description: "Critical Damage +1", repeat: 11 },
      {
        description: "MATK %-16, Accuracy-26, Magic Pierce %-10, Accuracy %-7",
        repeat: 1
      },
      {
        description: "ATK % +9, Critical Damage % +9, Critical Damage +13, DEX % +10",
        repeat: 1
      }
    ],
    successRate: 96,
    materials: {
      beast: 19250,
      wood: 113300,
      metal: 0,
      cloth: 0,
      medicine: 138700,
      mana: 100039,
      highestPerStep: 119450
    }
  },
  {
    id: "dte-stat-full-cd",
    title: "DTE + Stat Full CD",
    type: "Armor",
    stats: [
      { name: "% stronger against Fire", value: 24 },
      { name: "Critical Damage %", value: 10 },
      { name: "Critical Damage", value: 20 },
      { name: "STR %", value: 10 },
      { name: "MATK %", value: -16 },
      { name: "Magic Pierce %", value: -10 },
      { name: "Accuracy", value: -26 },
      { name: "Accuracy %", value: -7 }
    ],
    originalPotential: 0,
    startingPotential: 110,
    steps: [
      { description: "% stronger against Fire +1", repeat: 1 },
      { description: "Critical Damage % +1", repeat: 9 },
      { description: "Critical Damage +1", repeat: 3 },
      {
        description: "MATK %-16, Magic Pierce %-10, Accuracy-26, Accuracy %-7",
        repeat: 1
      },
      {
        description: "% stronger against Fire +23, Critical Damage % +1, Critical Damage +17, STR % +10",
        repeat: 1
      }
    ],
    successRate: 88,
    materials: {
      beast: 19250,
      wood: 113300,
      metal: 0,
      cloth: 0,
      medicine: 119450,
      mana: 189065,
      highestPerStep: 174561
    }
  },
  {
    id: "dte-full-crit",
    title: "DTE Full Crit",
    type: "Armor",
    stats: [
      { name: "% stronger against Dark", value: 24 },
      { name: "Critical Rate", value: 32 },
      { name: "Critical Damage %", value: 10 },
      { name: "Critical Damage", value: 24 },
      { name: "MATK %", value: -16 },
      { name: "Magic Pierce %", value: -9 },
      { name: "Accuracy", value: -26 },
      { name: "Accuracy %", value: -7 }
    ],
    originalPotential: 0,
    startingPotential: 111,
    steps: [
      { description: "Critical Damage % +1", repeat: 1 },
      { description: "Critical Damage +1", repeat: 19 },
      {
        description: "Critical Rate +1, MATK %-16, Magic Pierce %-9, Accuracy-26, Accuracy %-7",
        repeat: 1
      },
      { description: "Critical Rate +1", repeat: 24 },
      {
        description: "% stronger against Dark +24, Critical Rate +7, Critical Damage % +9, Critical Damage +5",
        repeat: 1
      }
    ],
    successRate: 100,
    materials: {
      beast: 0,
      wood: 103300,
      metal: 0,
      cloth: 0,
      medicine: 119450,
      mana: 279739,
      highestPerStep: 211344
    }
  },
  {
    id: "armor-magic-vit",
    title: "Armor Magic -VIT",
    type: "Armor",
    stats: [
      { name: "MATK %", value: 10 },
      { name: "INT %", value: 10 },
      { name: "Critical Damage", value: 20 },
      { name: "Critical Rate", value: 30 },
      { name: "VIT", value: -32 },
      { name: "ATK %", value: -16 },
      { name: "Physical Pierce %", value: -9 },
      { name: "Accuracy", value: -26 }
    ],
    originalPotential: 0,
    startingPotential: 64,
    steps: [
      {
        description: "MATK % +2, INT % +1, Critical Damage +3",
        repeat: 1
      },
      { description: "Critical Rate +4", repeat: 1 },
      {
        description: "VIT-24, ATK %-16, Physical Pierce %-9",
        repeat: 1
      },
      { description: "VIT-6", repeat: 1 },
      { description: "Critical Rate +1", repeat: 5 },
      { description: "Critical Rate +2", repeat: 1 },
      { description: "Critical Rate +1", repeat: 19 },
      {
        description: "MATK % +8, INT % +9, Critical Damage +17, VIT-2, Accuracy-26",
        repeat: 1
      }
    ],
    successRate: 100,
    materials: {
      beast: 103300,
      wood: 38500,
      metal: 286000,
      cloth: 0,
      medicine: 105450,
      mana: 94590,
      highestPerStep: 122500
    }
  },
  {
    id: "ele-dte-a-cd-flat",
    title: "Ele Dte A Cd Flat",
    type: "Weapon",
    stats: [
      { name: "Light Element", value: 1 },
      { name: "% stronger against Dark", value: 24 },
      { name: "ATK %", value: 16 },
      { name: "Critical Damage", value: 24 },
      { name: "Natural HP Regen", value: -32 },
      { name: "MDEF %", value: -14 },
      { name: "Dodge", value: -26 },
      { name: "Dodge %", value: -7 }
    ],
    originalPotential: 0,
    startingPotential: 137,
    steps: [
      {
        description: "Natural HP Regen-28, MDEF %-5, Dodge-26, Dodge %-7",
        repeat: 1
      },
      {
        description: "Natural HP Regen-4, MDEF %-9",
        repeat: 1
      },
      {
        description: "Light Element +1, % stronger against Dark +24, ATK % +16, Critical Damage +24",
        repeat: 1
      }
    ],
    successRate: 94,
    materials: {
      beast: 74800,
      wood: 0,
      metal: 336750,
      cloth: 119450,
      medicine: 0,
      mana: 203439,
      highestPerStep: 203439
    }
  },

  // ==========================================
  // FORMULA BARU
  // ==========================================

  {
    id: "netral-stat-cd-cr-flat",
    title: "Netral Stat dengan CD + CR Flat",
    type: "Armor",
    stats: [
      { name: "ATK %", value: 11 },
      { name: "DEX %", value: 10 },
      { name: "Critical Damage", value: 24 },
      { name: "Critical Rate", value: 32 },
      { name: "Accuracy", value: -26 },
      { name: "Magic Pierce %", value: -9 },
      { name: "MATK %", value: -16 },
      { name: "Accuracy %", value: -7 }
    ],
    originalPotential: 0,
    startingPotential: 57,
    steps: [
      { description: "ATK % +2", repeat: 1 },
      { description: "Critical Rate +1", repeat: 1 },
      {
        description: "Accuracy-26, Magic Pierce %-9, MATK %-16, Accuracy %-7",
        repeat: 1
      },
      { description: "Critical Rate +1", repeat: 22 },
      {
        description: "ATK % +9, DEX % +10, Critical Damage +19, Critical Rate +9",
        repeat: 1
      }
    ],
    successRate: 100,
    materials: {
      beast: 25300,
      wood: 103300,
      metal: 0,
      cloth: 0,
      medicine: 138700,
      mana: 137989,
      highestPerStep: 119450
    }
  },
  {
    id: "dte-atk-stat-cd-non-ele",
    title: "Dte Atk Stat CD% non Ele",
    type: "Weapon",
    stats: [
      { name: "% stronger against Earth", value: 24 },
      { name: "ATK %", value: 16 },
      { name: "STR %", value: 10 },
      { name: "Critical Damage %", value: 12 },
      { name: "Natural HP Regen", value: -33 },
      { name: "Natural MP Regen", value: -16 },
      { name: "Dodge", value: -26 },
      { name: "MDEF %", value: -14 }
    ],
    originalPotential: 0,
    startingPotential: 128,
    steps: [
      {
        description: "Natural HP Regen-33, Natural MP Regen-16, Dodge-26, MDEF %-14",
        repeat: 1
      },
      {
        description: "% stronger against Earth +24, ATK % +16, STR % +10, Critical Damage % +12",
        repeat: 1
      }
    ],
    successRate: 64,
    materials: {
      beast: 94050,
      wood: 74800,
      metal: 363975,
      cloth: 105450,
      medicine: 0,
      mana: 155000,
      highestPerStep: 363975
    }
  },
  {
    id: "stat-netral-full-crit",
    title: "Stat Netral Full Crit",
    type: "Weapon",
    stats: [
      { name: "ATK %", value: 12 },
      { name: "DEX %", value: 10 },
      { name: "Critical Damage %", value: 10 },
      { name: "Critical Damage", value: 24 },
      { name: "Critical Rate", value: 32 },
      { name: "Natural HP Regen", value: -32 },
      { name: "Dodge", value: -26 },
      { name: "DEF %", value: -14 }
    ],
    originalPotential: 0,
    startingPotential: 124,
    steps: [
      { description: "ATK % +7", repeat: 1 },
      { description: "Critical Damage % +4", repeat: 1 },
      { description: "Critical Damage +1", repeat: 4 },
      { description: "Critical Rate +1", repeat: 1 },
      {
        description: "Natural HP Regen-32, Dodge-26, DEF %-14",
        repeat: 1
      },
      { description: "Critical Rate +1", repeat: 19 },
      {
        description: "ATK % +5, DEX % +10, Critical Damage % +6, Critical Damage +20, Critical Rate +12",
        repeat: 1
      }
    ],
    successRate: 55,
    materials: {
      beast: 32500,
      wood: 0,
      metal: 336750,
      cloth: 105450,
      medicine: 19250,
      mana: 157239,
      highestPerStep: 336750
    }
  },
  {
    id: "ele-dte-atk-stat-cd-flat",
    title: "Ele Dte Atk Stat CD Flat",
    type: "Weapon",
    stats: [
      { name: "Fire Element", value: 1 },
      { name: "% stronger against Earth", value: 23 },
      { name: "ATK %", value: 10 },
      { name: "DEX %", value: 10 },
      { name: "Critical Damage", value: 22 },
      { name: "Natural HP Regen", value: -31 },
      { name: "DEF %", value: -14 },
      { name: "Dodge", value: -26 }
    ],
    originalPotential: 0,
    startingPotential: 127,
    steps: [
      {
        description: "Natural HP Regen-31, DEF %-14, Dodge-26",
        repeat: 1
      },
      {
        description: "Fire Element +1, % stronger against Earth +23, ATK % +10, DEX % +10, Critical Damage +22",
        repeat: 1
      }
    ],
    successRate: 71,
    materials: {
      beast: 19250,
      wood: 0,
      metal: 311150,
      cloth: 105450,
      medicine: 19250,
      mana: 170818,
      highestPerStep: 311150
    }
  },
  {
    id: "ele-dte-atk-stat-cd-percent",
    title: "Ele Dte Atk Stat CD%",
    type: "Weapon",
    stats: [
      { name: "Fire Element", value: 1 },
      { name: "% stronger against Earth", value: 24 },
      { name: "ATK %", value: 10 },
      { name: "DEX %", value: 10 },
      { name: "Critical Damage %", value: 10 },
      { name: "Natural HP Regen", value: -31 },
      { name: "MDEF %", value: -14 },
      { name: "Dodge", value: -26 }
    ],
    originalPotential: 0,
    startingPotential: 130,
    steps: [
      {
        description: "Natural HP Regen-31, MDEF %-14, Dodge-26",
        repeat: 1
      },
      {
        description: "Fire Element +1, % stronger against Earth +24, ATK % +10, DEX % +10, Critical Damage % +10",
        repeat: 1
      }
    ],
    successRate: 47,
    materials: {
      beast: 14130,
      wood: 15031,
      metal: 86787,
      cloth: 27460,
      medicine: 19250,
      mana: 46807,
      highestPerStep: 129278
    }
  }
];