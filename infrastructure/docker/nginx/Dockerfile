FROM nginx:1.25-alpine

RUN apk add --no-cache curl certbot

RUN mkdir -p /var/www/certbot /etc/nginx/ssl

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
