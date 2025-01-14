#ifndef MARIA_H
#define MARIA_H

#include <string>
#include <map>
#include <vector>
#include <memory>

// Include necessary libraries for MariaDB Connector/C++
#include <mariadb/conncpp/Driver.hpp>
#include <mariadb/conncpp/Connection.hpp>
#include <mariadb/conncpp/Exception.hpp>
#include <mariadb/conncpp/PreparedStatement.hpp>
#include <mariadb/conncpp/ResultSet.hpp>
#include <mariadb/conncpp/ResultSetMetaData.hpp>
#include <mariadb/conncpp/SQLString.hpp>
#include <mariadb/conncpp/Properties.hpp>

class Maria {
public:
    Maria(const std::string& dbname);  // Constructor to initialize the database
    ~Maria();                        // Destructor

    bool connect();  // Method to establish a database connection
    std::vector<std::map<std::string, std::string>> fa(const std::string&, const std::map<int, std::string>&);
    std::map<std::string, std::string> f(const std::string&, const std::map<int, std::string>&);
    bool inse(std::string, std::map<std::string, std::string>);
    bool q(const std::string&, const std::map<int, std::string>&);

private:
    std::string dbname_;  // Store the database name
    sql::Driver* driver_; // MySQL driver (use only if C++ Connector is needed)
    std::shared_ptr<sql::Connection> conn_;            // Database connection
};

#endif // MARIA_H