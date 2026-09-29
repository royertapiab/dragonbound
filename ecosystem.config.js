const path = require('path');

module.exports = {
  apps: [
    {
      name: 'dragonbound-web',
      script: 'src/web/main/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'dragonbound-game',
      script: 'src/game.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        vps: '1'
      }
    },
    {
      name: 'dragonbound-scheduler',
      script: 'src/ranking/scheduler.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'dragonbound-admin',
      script: 'src/server.js',
      cwd: path.join(__dirname, 'admin'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
