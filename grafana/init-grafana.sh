#!/bin/bash

# Attendre que Grafana soit opérationnel
until $(curl --output /dev/null --silent --head --fail http://localhost:3000); do
    printf 'wait for launch grafana'
    sleep 5
done

# Créer un utilisateur
curl -X POST http://${GF_SECURITY_ADMIN_USER}:${GF_SECURITY_ADMIN_PASSWORD}@localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
        "name":"usertest",
        "email":"testemail@test.com",
        "login":"test",
        "password":"test"
      }'