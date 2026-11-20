#!/bin/sh
# Gera um certificado autoassinado se a pasta de certificados estiver vazia.
# Para usar um certificado de verdade, coloque cert.pem e key.pem em ./certs no projeto.
set -e
DIR=/etc/nginx/certs
if [ ! -s "$DIR/cert.pem" ] || [ ! -s "$DIR/key.pem" ]; then
  echo "[certificado] nenhum certificado em $DIR; gerando um autoassinado (válido por 825 dias)"
  mkdir -p "$DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout "$DIR/key.pem" -out "$DIR/cert.pem" \
    -subj "/CN=${CERT_NOME:-localhost}" \
    -addext "subjectAltName=DNS:localhost,DNS:${CERT_NOME:-localhost},IP:127.0.0.1"
  chmod 600 "$DIR/key.pem"
fi
