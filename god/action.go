/*
 Action Ermis is the beginning of Action with it's websocket server and fs.watch that dominates the system
 This go part integrate this process into Microservices
 exeActions exported to index.js:
 `Instantiate Actions |  const { exeActions } = require('./action');exeActions(app);
 Running Web Socket Server for RealTime Actions; WServer(server,app,exeActions);

--> uses Maria, Messenger
--> runs in systemsid ermis
 TODO utilize ci/cd process (through Github) example in the end
 TODO utilize the power of event driven kafka logic
 TODO utilize the power of unit testing
 TODO use the manifest.md as high level filesystem & sql standarization
GitHub Actions CI/CD workflow
Trigger: The workflow runs when changes are pushed to the main branch
or when a pull request is made to the main branch.
write PHP scripts for your database actions (action, actiongrp) that run when triggered during your CI/CD pipeline.
- name: Run database schema migration
  run: |
    php db-schema-action.php --action migrate
    <?php
    // db-schema-action.php
    if ($argv[1] === 'migrate') {
        // Call migration logic (e.g., using PDO for MySQL database)
        echo "Migrating database schema...\n";
    }
- name: Deploy to server
  run: |
    ssh user@yourserver.com "bash -s" < ./deploy.sh
    ?>
*/