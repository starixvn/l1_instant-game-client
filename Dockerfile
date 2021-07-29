FROM registry.nexdev.net:5050/docker/nginx:1.19.5
COPY ./.nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./build/web-mobile/ /usr/share/nginx/html
