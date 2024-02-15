#!/bin/bash

/run.sh &

# Attendre que Grafana soit opérationnel
while ! curl -s "http://localhost:3000/api/health" | grep "ok"; do
  echo "test-------------------------------"
   sleep 5
done

# Créer un utilisateur
curl -X POST http://${GF_SECURITY_ADMIN_USER}:${GF_SECURITY_ADMIN_PASSWORD}@localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
        "name":"usertest4",
        "email":"testemail@test4.com",
        "login":"test4",
        "password":"test4"
      }'

tail -f /dev/null