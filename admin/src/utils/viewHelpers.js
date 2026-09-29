/**
 * View Helper Functions & Constants for DragonBound Admin
 */

const RANKS = {
    0: { name: 'Pollito (Chick)', icon: '0.gif', tier: 'chick' },
    1: { name: 'Martillo de Madera (Wooden Hammer)', icon: '1.gif', tier: 'hammer' },
    2: { name: 'Doble Martillo Madera (Double Wooden Hammer)', icon: '2.gif', tier: 'hammer' },
    3: { name: 'Martillo de Piedra (Stone Hammer)', icon: '3.gif', tier: 'hammer' },
    4: { name: 'Doble Martillo Piedra (Double Stone Hammer)', icon: '4.gif', tier: 'hammer' },
    5: { name: 'Hacha de Batalla (Battle Axe)', icon: '5.gif', tier: 'axe' },
    6: { name: 'Hacha de Batalla + (Battle Axe Plus)', icon: '6.gif', tier: 'axe' },
    7: { name: 'Doble Hacha Batalla (Double Battle Axe)', icon: '7.gif', tier: 'axe' },
    8: { name: 'Doble Hacha Batalla + (Double Battle Axe Plus)', icon: '8.gif', tier: 'axe' },
    9: { name: 'Hacha Plateada (Silver Axe)', icon: '9.gif', tier: 'silver_axe' },
    10: { name: 'Hacha Plateada + (Silver Axe Plus)', icon: '10.gif', tier: 'silver_axe' },
    11: { name: 'Doble Hacha Plateada (Double Silver Axe)', icon: '11.gif', tier: 'silver_axe' },
    12: { name: 'Doble Hacha Plateada + (Double Silver Axe Plus)', icon: '12.gif', tier: 'silver_axe' },
    13: { name: 'Hacha Dorada (Golden Axe)', icon: '13.gif', tier: 'gold_axe' },
    14: { name: 'Hacha Dorada + (Golden Axe Plus)', icon: '14.gif', tier: 'gold_axe' },
    15: { name: 'Doble Hacha Dorada (Double Gold Axe)', icon: '15.gif', tier: 'gold_axe' },
    16: { name: 'Doble Hacha Dorada + (Double Gold Axe Plus)', icon: '16.gif', tier: 'gold_axe' },
    17: { name: 'Cetro Violeta (Violet Wand)', icon: '17.gif', tier: 'wand' },
    18: { name: 'Cetro Zafiro (Sapphire Wand)', icon: '18.gif', tier: 'wand' },
    19: { name: 'Cetro Rubí (Ruby Wand)', icon: '19.gif', tier: 'wand' },
    20: { name: 'Cetro Diamante (Diamond Wand)', icon: '20.gif', tier: 'wand' },
    21: { name: 'Dragón Violeta (Violet Dragon)', icon: '21.gif', tier: 'dragon' },
    22: { name: 'Dragón Azul (Blue Dragon)', icon: '22.gif', tier: 'dragon' },
    23: { name: 'Dragón Rojo (Red Dragon)', icon: '23.gif', tier: 'dragon' },
    24: { name: 'Dragón Plateado (Silver Dragon)', icon: '24.gif', tier: 'dragon' },
    26: { name: 'Game Master (GM Oficial)', icon: '26.gif', tier: 'staff' },
    27: { name: 'Staff Especial (New GM)', icon: '27.gif', tier: 'staff' },
    28: { name: 'Dragón Bronce (Bronze Dragon)', icon: '28.gif', tier: 'special' },
    29: { name: 'Dragón Plata (Silver Rank)', icon: '29.gif', tier: 'special' },
    30: { name: 'Dragón Oro (Gold Rank)', icon: '30.gif', tier: 'special' },
    31: { name: 'VIP Super Admin (Owner)', icon: '31.gif', tier: 'owner' }
};

const AVATAR_TYPES = {
    0: 'Cabeza (Head)',
    1: 'Cuerpo (Body)',
    2: 'Lentes / Ojos (Glasses)',
    3: 'Bandera (Flag)',
    4: 'Fondo (Background)',
    5: 'Frente (Foreground)',
    6: 'Ex-Item (Especial)'
};

const GENDERS = {
    0: 'Hombre (M)',
    1: 'Mujer (F)',
    2: 'Unisex'
};

function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('es-ES');
}

function formatDate(date) {
    if (!date) return '—';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        return d.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return String(date);
    }
}

function getRankInfo(rankId) {
    const id = parseInt(rankId, 10);
    return RANKS[id] || { name: `Rango ${id}`, icon: '0.gif', tier: 'normal' };
}

function getAvatarTypeName(typeId) {
    const id = parseInt(typeId, 10);
    return AVATAR_TYPES[id] || `Tipo ${id}`;
}

function getGenderName(gender) {
    if (gender === 'm' || gender === 0 || gender === '0') return 'Hombre (M)';
    if (gender === 'f' || gender === 1 || gender === '1') return 'Mujer (F)';
    return 'Unisex';
}

module.exports = {
    RANKS,
    AVATAR_TYPES,
    GENDERS,
    formatNumber,
    formatDate,
    getRankInfo,
    getAvatarTypeName,
    getGenderName
};
