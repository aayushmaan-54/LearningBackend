# NGINX Configuration Guide

## Table of Contents
- [Introduction](#introduction)
- [Basic Commands](#basic-commands)
- [Configuration Structure](#configuration-structure)
- [Basic Configuration](#basic-configuration)
- [Virtual Hosts](#virtual-hosts)
- [Location Blocks](#location-blocks)
- [Reverse Proxy](#reverse-proxy)
- [Load Balancing](#load-balancing)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Security Best Practices](#security-best-practices)
- [Performance Optimization](#performance-optimization)
- [Logging and Monitoring](#logging-and-monitoring)
- [Common Use Cases](#common-use-cases)

## Introduction

NGINX is a high-performance web server, reverse proxy, load balancer, and HTTP cache. Key features include:

- High performance and scalability
- Low memory footprint
- Event-driven, asynchronous architecture
- Ability to handle concurrent connections efficiently

## Basic Commands

```bash
# Installation
sudo apt update
sudo apt install nginx

# Service Management
sudo systemctl start nginx    # Start NGINX
sudo systemctl stop nginx     # Stop NGINX
sudo systemctl restart nginx  # Restart NGINX
sudo systemctl reload nginx   # Reload configuration without stopping
# OR
sudo nginx -s reload

# Configuration Testing
sudo nginx -t                 # Test configuration

# Version Information
nginx -v                      # Show version
nginx -V                      # Show version and build information
```

## Configuration Structure

Main configuration file location and structure:

```
/etc/nginx/
├── nginx.conf
├── conf.d/
│   └── default.conf
├── sites-available/
│   └── default
├── sites-enabled/
│   └── default -> ../sites-available/default
├── modules-enabled/
├── modules-available/
└── mime.types
```

## Basic Configuration

### Main Configuration Block

```nginx
# Main context
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Events context
events {
    worker_connections 1024;
    multi_accept on;
}

# HTTP context
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Logging Settings
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Include other configurations
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

## Virtual Hosts

### Basic Server Block

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Multiple Domains

```nginx
server {
    listen 80;
    server_name site1.com www.site1.com;
    root /var/www/site1;
}

server {
    listen 80;
    server_name site2.com www.site2.com;
    root /var/www/site2;
}
```

## Location Blocks

### Location Block Types

```nginx
# Exact match
location = /path {
    # ...
}

# Preferential prefix match
location ^~ /images/ {
    # ...
}

# Regular expression match (case-sensitive)
location ~ \.php$ {
    # ...
}

# Regular expression match (case-insensitive)
location ~* \.(jpg|jpeg|png)$ {
    # ...
}

# Prefix match
location /api/ {
    # ...
}
```

### Common Location Block Directives

```nginx
location / {
    root /var/www/html;
    index index.html;
    try_files $uri $uri/ /index.html;
    
    # Cache Control
    expires 30d;
    add_header Cache-Control "public, no-transform";
    
    # CORS
    add_header 'Access-Control-Allow-Origin' '*';
}
```

## Reverse Proxy

### Basic Proxy Configuration

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Load Balancing

### Load Balancer Configuration

```nginx
upstream backend {
    # Round Robin (default)
    server backend1.example.com:8080;
    server backend2.example.com:8080;
    
    # Least Connections
    least_conn;
    
    # IP Hash
    ip_hash;
    
    # Weighted Round Robin
    server backend1.example.com:8080 weight=3;
    server backend2.example.com:8080 weight=1;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
    }
}
```

## SSL/TLS Configuration

### SSL Server Block

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
}
```

## Security Best Practices

### Security Headers

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Rate Limiting

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;

# Apply rate limiting
location /api/ {
    limit_req zone=one burst=5 nodelay;
}
```

## Performance Optimization

### Gzip Compression

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
```

### Browser Caching

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}
```

### FastCGI Cache

```nginx
fastcgi_cache_path /tmp/nginx_cache levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;

location ~ \.php$ {
    fastcgi_cache my_cache;
    fastcgi_cache_use_stale error timeout http_500 http_503;
    fastcgi_cache_valid 200 60m;
}
```

## Logging and Monitoring

### Custom Log Format

```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

access_log /var/log/nginx/access.log main;
```

### Debug Logging

```nginx
error_log /var/log/nginx/error.log debug;
```

### Status Module

```nginx
location /nginx_status {
    stub_status on;
    allow 127.0.0.1;
    deny all;
}
```

## Common Use Cases

### PHP-FPM Configuration

```nginx
location ~ \.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_intercept_errors on;
}
```