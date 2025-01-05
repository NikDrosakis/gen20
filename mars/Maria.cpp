#include <mariadb/mysql.h>
#include <iostream>
#include <map>
#include <string>  // <-- Add this line for std::string
#include "Gredis.cpp"  // If you're including other files

class Maria {

private:
    std::string _dbHost;
    std::string _dbUser;
    std::string _dbPass;
    std::string _database;

    // Database connection object, use your DB connector (MySQL, MariaDB C++ connector, etc.)
    MYSQL *conn;

public:
    // Constructor
    Maria(std::string dbname = "") {
        _dbHost = "localhost";
        _dbUser = "root";
        _dbPass = "n130177!";
        _database = dbname;
        conn = mysql_init(NULL);
    }

    // Connect to database
    bool connect() {
        if (conn == NULL) {
            std::cerr << "MySQL initialization failed!" << std::endl;
            return false;
        }
        if (mysql_real_connect(conn, _dbHost.c_str(), _dbUser.c_str(),
                               _dbPass.c_str(), _database.c_str(), 0, NULL, 0) == NULL) {
            std::cerr << "MySQL connection failed: " << mysql_error(conn) << std::endl;
            return false;
        }
        return true;
    }

    // Insert function (simplified)
    bool insert(std::string table, std::map<std::string, std::string> params) {
        std::string query = "INSERT INTO " + table + " (";
        for (const auto &param : params) {
            query += param.first + ",";
        }
        query.pop_back(); // Remove trailing comma
        query += ") VALUES (";
        for (const auto &param : params) {
            query += "'" + param.second + "',";
        }
        query.pop_back(); // Remove trailing comma
        query += ")";

        if (mysql_query(conn, query.c_str())) {
            std::cerr << "Insert failed: " << mysql_error(conn) << std::endl;
            return false;
        }
        return true;
    }

    // Other CRUD operations (UPDATE, SELECT, DELETE) go here
};
