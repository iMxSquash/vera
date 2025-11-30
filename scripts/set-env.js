#!/usr/bin/env node

/**
 * Script pour générer les fichiers environment.ts à partir du .env
 * Lit automatiquement toutes les variables du .env et les injecte dans le fichier approprié
 * Usage: node scripts/set-env.js [--production]
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis .env
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
    console.error('❌ Erreur lors de la lecture du fichier .env:', envConfig.error);
    process.exit(1);
}

// Déterminer le mode (production ou développement)
const isProduction = process.argv.includes('--production') || process.env.PRODUCTION === 'true';

// Variables sensibles à exclure du client (ne doivent jamais être exposées au navigateur)
const SENSITIVE_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ADMIN_PASSWORD_HASH',
    'ADMIN_EMAIL', // Email peut rester côté backend uniquement
];

// Variables spécifiques au backend uniquement
const SERVER_ONLY_VARS = [
    ...SENSITIVE_VARS,
    'PORT',
    'NODE_ENV',
];

// Fonction pour convertir une variable d'environnement en camelCase
function toCamelCase(str) {
    return str
        .toLowerCase()
        .split('_')
        .map((word, index) => {
            if (index === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
}

// Fonction pour formater la valeur (ajouter des quotes si c'est une string)
function formatValue(value) {
    // Si c'est un booléen
    if (value === 'true' || value === 'false') {
        return value;
    }
    // Si c'est un nombre
    if (!isNaN(value) && value.trim() !== '') {
        return value;
    }
    // Sinon, c'est une string
    return `'${value.replace(/'/g, "\\'")}'`;
}

// Construire l'objet environment à partir des variables du .env
const envVars = {};
let excludedVars = [];

Object.keys(process.env).forEach((key) => {
    // Ignorer les variables système et les variables sensibles
    if (SERVER_ONLY_VARS.includes(key)) {
        excludedVars.push(key);
        return;
    }

    // Ignorer les variables qui ne viennent pas de notre .env
    if (!envConfig.parsed || !Object.prototype.hasOwnProperty.call(envConfig.parsed, key)) {
        return;
    }

    const camelKey = toCamelCase(key);
    envVars[camelKey] = process.env[key];
});

// Ajouter la variable production
envVars.production = isProduction;

// Ajuster certaines URLs selon l'environnement
if (!isProduction && envVars.serverUrl) {
    envVars.apiUrl = `${envVars.serverUrl}/api`;
} else if (isProduction && !envVars.apiUrl) {
    envVars.apiUrl = '/api'; // En production, utiliser un chemin relatif par défaut si non défini
}

// Générer le contenu du fichier TypeScript
const envProperties = Object.keys(envVars)
    .sort((a, b) => {
        // production en premier
        if (a === 'production') return -1;
        if (b === 'production') return 1;
        return a.localeCompare(b);
    })
    .map((key) => {
        const value = envVars[key];
        if (key === 'production') {
            return `  production: ${value}`;
        }
        return `  ${key}: ${formatValue(value)}`;
    })
    .join(',\n');

const fileContent = `// ⚠️ Ce fichier est généré automatiquement par le script set-env.js
// Ne le modifiez pas manuellement, modifiez plutôt le fichier .env à la racine du projet
// Exécutez 'pnpm set-env' pour le régénérer

export const environment = {
${envProperties},
};
`;

// Déterminer le chemin du fichier à générer
const targetPath = isProduction
    ? path.resolve(__dirname, '../libs/client/shared/environments/src/lib/environment.ts')
    : path.resolve(__dirname, '../libs/client/shared/environments/src/lib/environment.development.ts');

// Écrire le fichier
try {
    fs.writeFileSync(targetPath, fileContent);

    const fileName = isProduction ? 'environment.ts' : 'environment.development.ts';
    console.log(`✅ ${fileName} généré avec succès`);
    console.log(`   Mode: ${isProduction ? '🚀 Production' : '🔧 Développement'}`);

    console.log('\n📋 Variables injectées:');
    Object.keys(envVars)
        .sort()
        .forEach((key) => {
            const value = envVars[key];
            const displayValue = typeof value === 'string' && value.length > 50
                ? value.substring(0, 50) + '...'
                : value;
            console.log(`   - ${key}: ${displayValue}`);
        });

    if (excludedVars.length > 0) {
        console.log('\n🔒 Variables exclues (backend uniquement):');
        excludedVars.forEach((key) => {
            console.log(`   - ${key}`);
        });
    }

    console.log(`\n💡 Fichier généré: ${path.relative(process.cwd(), targetPath)}`);
} catch (error) {
    console.error('❌ Erreur lors de la génération du fichier environment:', error);
    process.exit(1);
}
