# ============================================================
# STAGE 1 - BUILD DO FRONTEND
# ============================================================

FROM node:22-alpine AS build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_APPS_SCRIPT_URL
ARG VITE_FORM_URL
ARG VITE_SECONDARY_APPS_SCRIPT_URL

ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
ENV VITE_APPS_SCRIPT_URL=$VITE_APPS_SCRIPT_URL
ENV VITE_FORM_URL=$VITE_FORM_URL
ENV VITE_SECONDARY_APPS_SCRIPT_URL=$VITE_SECONDARY_APPS_SCRIPT_URL

RUN npm run build


# ============================================================
# STAGE 2 - SERVIDOR DE PRODUÇÃO
# ============================================================

FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/frontend/dist /usr/share/nginx/html/empreender

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]