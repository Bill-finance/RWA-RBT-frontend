module.exports = {
  apps: [
    {
      name: 'rwa-rbt-fe',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        NEXT_PUBLIC_ENV: 'development',
        DEBUG: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://TODO.com',
        NEXT_PUBLIC_ENV: 'production',
        DEBUG: 'false',
        NEXT_TELEMETRY_DISABLED: '1',
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    }
  ]
}; 