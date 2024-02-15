FROM grafana/grafana:latest
ADD ./provisioning /etc/grafana/provisioning
ADD ./dashboards /var/lib/grafana/dashboards
#ADD ./init-grafana.sh /init-grafana.sh

# Make sure the script is executable

# Set the entrypoint
#ENTRYPOINT ["/init-grafana.sh"]