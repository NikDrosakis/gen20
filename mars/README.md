#GEN20 > MARS --No API WS Client--
c++ management tool

YAML manifest would provide the following:
Project Details: Metadata about the project such as its name, version, dependencies, and author.
Actions: This section lists specific actions that the system can perform, such as routes, database operations, or scheduled tasks.
Configuration: This provides database or system configuration options that are required to run the project.


#v1 - Integration Level jan25
- Input cli level
- Parse yaml file
- core.Maria > maria connector CRUD & INDEX AND MANAGE THE WHOLE SCHEMA
- core.Gredis > heredis PUBSUB + CRUD LISTS NATIVE PROCESS WITH CAPABILITIES
- API INTERACTION with libcurl (no pistache USE THE PUBSUB)
- STANDALONE Connect with version.cpp & create the daemon subsystem Mars
-  MICROSERVICES perform better in terms of processing efficiency and speed, especially for computational tasks
- AI pretrained Have binding at TensorFlow, Bert, Onnx to train models
- CLI chat with generatives or irc channel through liburl
- version.cpp to replace ver.sh

1) Maria
2) Manifest YAML
3) WS Client connected
4) Redis read the keys 
5) Rethink 
6) Αυτό είναι το μεγάλο πλάνο 
map Mariadb --> binlog -> trigger mars --> fs -> inotify -> mars -> mariadb

5) Action.go, Actionplan.go
6) Training
7) Ai Gen

main.cpp:

Initialize Mars components.

Create threads or asynchronous tasks for:

Binlog processing and filesystem writing.

Filesystem monitoring and MariaDB updating.

Handle program termination.

core/Maria.cpp/h:

Add methods to:

Connect to MariaDB.

Consume binlog events.

Execute SQL queries.

core/ws.cpp/h:

(Optional) If you need to send events over websockets

core/Yaml.cpp/h:

(Optional) If you need to use YAML configuration

New core/FS.cpp/h:

Add methods to:

Read and write files.

Monitor filesystem changes using inotify (or similar).

Certainly, here's a concise answer focusing on a fast connection between MariaDB and the file system (FS) using C++ and Mars:
Approach:
⦁	Direct Memory Mapping: Utilize Mars's memory mapping capabilities to directly map MariaDB tables into memory. This eliminates the need for constant data transfers between the database and application, significantly improving performance.
⦁	Asynchronous Operations: Leverage Mars's asynchronous I/O features to overlap database operations with file system access. This maximizes resource utilization and minimizes blocking.
⦁	Optimized Data Structures: Employ efficient data structures (e.g., in-memory indexes, caches) within Mars to accelerate data retrieval and manipulation.
Example (Conceptual):
C++
// Map a MariaDB table into memory mars::Table table = mars::Table::map("my_database", "my_table"); // Read data from the table directly into memory std::vector<std::string> data = table.select<std::string>("column_name"); // Write data to the file system std::ofstream file("my_file.txt"); for (const auto& value : data) { file << value << std::endl; }
Key Considerations:
⦁	Memory Management: Carefully manage memory usage to avoid memory exhaustion, especially when dealing with large datasets.
⦁	Error Handling: Implement robust error handling to gracefully handle database connection issues, data inconsistencies, and file system errors.
⦁	Security: Ensure proper security measures are in place to protect sensitive data during in-memory operations.
Note: This is a simplified example. The actual implementation will depend on your specific requirements and the complexity of your application.
By combining these techniques, you can achieve a high-performance connection between MariaDB and the file system using C++ and Mars, enabling efficient data transfer and processing.

mars Table::map()--> maria binlog--> mars --> fs , fs --> inotify -->mars-->maria , so it can be bidirectional

// Map a MariaDB table into memory
mars::Table table = mars::Table::map("gen_admin", "cubo");
// Read data from the table directly into memory
std::vector<std::string> data = table.select<std::string>("name");  //column_name
// Write data to the file system
CUBO_ROOT= "/var/www/gs/gaia/";
CUBO_FOLDER=CUBO_ROOT + name;
std::ofstream file(CUBO_FOLDER);
for (const auto& value : data) {
file << value << std::endl;
}
//A challenges is creating fs triggers
1) AFTER UPDATE gen_admin.cubo.name, is updated
2) AFTER INSERT gen_admin.cubo.name, is created with public folder
   //B challenges is fs triggers db
3) when yaml is saved cubo is updating
   //C challenges for schema
   //D challenges for bundler
   //Ε challenges for action 