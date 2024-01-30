# Utiliser l'image officielle de Prometheus
FROM prom/prometheus:latest

# Copier le fichier de configuration Prometheus dans le conteneur
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Exposer le port 9090 pour accéder à l'interface web Prometheus
EXPOSE 9090