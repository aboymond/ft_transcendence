#!/bin/bash

/run.sh &

# Attendre que Grafana soit opérationnel
while ! curl -s "http://localhost:3000/api/health" | grep "ok"; do
  echo "waiting grafana up"
   sleep 5
done

# Créer un utilisateur
curl -X POST http://${GF_SECURITY_ADMIN_USER}:${GF_SECURITY_ADMIN_PASSWORD}@localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
        "name": "'${USER_GRAFANA_NAME}'",
        "email": "'${USER_GRAFANA_EMAIL}'",
        "login": "'${USER_GRAFANA_LOGIN}'",
        "password": "'${USER_GRAFANA_PASSWORD}'"
      }'

tail -f /dev/null