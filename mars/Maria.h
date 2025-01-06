#ifndef MARIA_H
#define MARIA_H

#include <string>
#include <map>
#include <vector>

// Include necessary libraries for MariaDB
#include <mysql/mysql.h>  // Main MariaDB/MySQL header for C API
// Ensure you have MySQL C++ Connector headers if needed
#include <mysql_connection.h>
class Maria {
public:
    Maria(const std::string& dbname);  // Constructor to initialize the database
    ~Maria();                        // Destructor

    bool connect();  // Method to establish a database connection
    std::vector<std::map<std::string, std::string>> fa(const std::string&, const std::map<int, std::string>&);
    std::map<std::string, std::string> f(const std::string&, const std::map<int, std::string>&);
    bool inse(std::string, std::map<std::string, std::string>);

private:
    std::string dbname_;  // Store the database name
    sql::mysql::MySQL_Driver* driver_; // MySQL driver (use only if C++ Connector is needed)
    sql::Connection* conn_;            // Database connection
};

#endif // MARIA_H
