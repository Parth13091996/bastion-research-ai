# Hostinger API healthcheck troubleshooting

Use this checklist when `https://dev-api.bastionresearch.in/healthcheck` works for some users but other users see a cancelled or timed-out request in browser network logs.

## Fast diagnosis

Run these from a network where the API is failing:

```bash
curl -4 -I --max-time 10 https://dev-api.bastionresearch.in/healthcheck
curl -6 -I --max-time 10 https://dev-api.bastionresearch.in/healthcheck
curl -I --resolve dev-api.bastionresearch.in:443:<SERVER_IPV4> https://dev-api.bastionresearch.in/healthcheck
```

If IPv4 succeeds but IPv6 times out, remove the broken `AAAA` DNS record or configure Nginx and the firewall to serve IPv6. This is the most common reason only some users fail, because their ISP/browser may prefer IPv6.

## Server-side checks

On the Hostinger VPS, verify each layer independently:

```bash
pm2 status
pm2 logs server-app --lines 100
curl -I --max-time 5 http://127.0.0.1:3001/healthcheck
sudo nginx -t
sudo systemctl status nginx --no-pager
curl -I --max-time 5 https://dev-api.bastionresearch.in/healthcheck
```

Expected result: every curl command should return `HTTP/1.1 200 OK` or `HTTP/2 200` quickly.

## Recommended Nginx proxy configuration

Keep the proxy simple for ordinary HTTP routes and add forwarding headers plus timeouts:

```nginx
server {
    server_name dev-api.bastionresearch.in;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/dev-api.bastionresearch.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev-api.bastionresearch.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name dev-api.bastionresearch.in;
    return 301 https://$host$request_uri;
}
```

Only keep `Upgrade` and `Connection: upgrade` headers in a separate location if the app actually serves WebSockets.

## Deployment reminder

After pulling backend changes on the server:

```bash
pnpm install --frozen-lockfile
pnpm --filter server build
pm2 restart server-app --update-env
pm2 save
```
