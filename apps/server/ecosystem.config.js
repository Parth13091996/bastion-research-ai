module.exports = {
  apps: [{
    name: "server-app",
    script: "./dist/index.js",
    cwd: "/root/Documents/bastion-research/apps/server",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3001,
      FRONTEND_URL: "https://dev.bastionresearch.in"
    }
  }]
};

