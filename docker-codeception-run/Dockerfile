FROM bscheshir/codeception:php7.4.3-fpm-alpine-yii2
# note: this Dockerfile will be used for autotest reason only. We can use RUN on each line as marker of potentially error breakpoint.
COPY ./run_tests.sh /run_tests.sh
RUN /bin/bash -c 'chmod +x /run_tests.sh'
RUN cat /run_tests.sh
RUN ls -luha /run_tests.sh
RUN curl -L https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -o /usr/local/bin/wait-for-it.sh
RUN /bin/bash -c 'chmod +x /usr/local/bin/wait-for-it.sh'
RUN ls -luha /usr/local/bin/wait-for-it.sh
ENTRYPOINT ["/usr/local/bin/wait-for-it.sh", "db:3306", "--", "/usr/local/bin/wait-for-it.sh", "browser:4444", "--", "/usr/local/bin/wait-for-it.sh", "backend.nginx:80", "--", "/run_tests.sh"]
RUN git clone https://github.com/bscheshirwork/yii2-app-advanced-rbac.git /var/www/html
RUN composer install --no-dev
# use --env=Development both with not use gii and debug modules
RUN cp /var/www/html/environments/prod/console/config/main-local.php /var/www/html/environments/dev/console/config/main-local.php
RUN cp /var/www/html/environments/prod/frontend/config/main-local.php /var/www/html/environments/dev/frontend/config/main-local.php
RUN cp /var/www/html/environments/prod/backend/config/main-local.php /var/www/html/environments/dev/backend/config/main-local.php
RUN ./init --env=Development --overwrite=All
