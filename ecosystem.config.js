module.exports = {
  apps: [
    {
      name: 'dompetku',
      script: 'npm',
      args: 'start',
      cwd: process.env.APP_DIR || process.cwd(),
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000
      }
    }
  ]
};
