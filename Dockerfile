FROM registry.nexdev.net:5050/docker/nginx:1.19.5

## Add user permissions
RUN chown -R nginx:nginx /usr/share/nginx && chmod -R 755 /usr/share/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

COPY ./.nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./build/web-mobile/ /usr/share/nginx/html
