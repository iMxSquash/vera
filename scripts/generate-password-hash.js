const bcrypt = require('bcrypt');

async function generateHash() {
    const password = process.argv[2] || 'Admin@2024';
    const saltRounds = 10;

    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('\n=== Générateur de Hash Bcrypt ===');
        console.log(`\nMot de passe: ${password}`);
        console.log(`Hash: ${hash}`);
        console.log('\nCopiez ce hash dans le fichier .env ou auth.service.ts\n');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

generateHash();
