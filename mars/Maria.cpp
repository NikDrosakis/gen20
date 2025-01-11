#include "Maria.h"
#include <iostream>
#include <map>
#include <string>
#include <stdexcept> // For exceptions
#include <memory>    // For std::shared_ptr
#include <mariadb/conncpp/Driver.hpp>
#include <mariadb/conncpp/Connection.hpp>
#include <mariadb/conncpp/Exception.hpp>
#include <mariadb/conncpp/PreparedStatement.hpp>
#include <mariadb/conncpp/ResultSet.hpp>
#include <mariadb/conncpp/ResultSetMetaData.hpp>
#include <mariadb/conncpp/SQLString.hpp>
#include <mariadb/conncpp/Properties.hpp>
// Constructor
Maria::Maria(const std::string& dbname)
    : dbname_(dbname), driver_(nullptr), conn_(nullptr) {
    driver_ = sql::mariadb::get_driver_instance();
}

// Destructor
Maria::~Maria() {
    if (conn_) {
        conn_->close();
    }
}

// Establish connection
bool Maria::connect() {
    try {
        sql::SQLString url("tcp://127.0.0.1:3306");  // Adjust host and port as needed
        sql::Properties properties({
            {"user", "root"},    // Replace with actual username
            {"password", "n130177!"} // Replace with actual password
        });
        conn_ = std::shared_ptr<sql::Connection>(driver_->connect(url, properties));
        conn_->setSchema(dbname_);
        return true;
    } catch (sql::SQLException &e) {
        std::cerr << "Connection failed: " << e.what() << std::endl;
        return false;
    }
}

// Fetch all rows
std::vector<std::map<std::string, std::string>> Maria::fa(const std::string& query, const std::map<int, std::string>& params) {
    std::vector<std::map<std::string, std::string>> result;
    try {
        std::shared_ptr<sql::PreparedStatement> pstmt(conn_->prepareStatement(query));
        int index = 1;
        for (const auto& param : params) {
            pstmt->setString(index++, param.second);
        }
        std::shared_ptr<sql::ResultSet> res(pstmt->executeQuery());
        sql::ResultSetMetaData* meta = res->getMetaData();
        int colCount = meta->getColumnCount();

        while (res->next()) {
            std::map<std::string, std::string> row;
            for (int col = 1; col <= colCount; ++col) {
                row[std::string(meta->getColumnName(col))] = res->getString(col); // Convert to std::string
            }
            result.push_back(row);
        }
    } catch (sql::SQLException &e) {
        std::cerr << "Fetch failed: " << e.what() << std::endl;
    }
    return result;
}

// Fetch one row
std::map<std::string, std::string> Maria::f(const std::string& query, const std::map<int, std::string>& params) {
    std::map<std::string, std::string> result;
    try {
        std::shared_ptr<sql::PreparedStatement> pstmt(conn_->prepareStatement(query));
        int index = 1;
        for (const auto& param : params) {
            pstmt->setString(index++, param.second);
        }
        std::shared_ptr<sql::ResultSet> res(pstmt->executeQuery());
        sql::ResultSetMetaData* meta = res->getMetaData();
        int colCount = meta->getColumnCount();

        if (res->next()) {
            for (int col = 1; col <= colCount; ++col) {
                result[std::string(meta->getColumnName(col))] = res->getString(col); // Convert to std::string
            }
        }
    } catch (sql::SQLException &e) {
        std::cerr << "Fetch failed: " << e.what() << std::endl;
    }
    return result;
}

// Execute a query
bool Maria::q(const std::string& query, const std::map<int, std::string>& params) {
    try {
        std::shared_ptr<sql::PreparedStatement> pstmt(conn_->prepareStatement(query));
        int index = 1;
        for (const auto& param : params) {
            pstmt->setString(index++, param.second);
        }
        pstmt->execute();
        return true;
    } catch (sql::SQLException &e) {
        std::cerr << "Query failed: " << e.what() << std::endl;
        return false;
    }
}

// Insert a row
bool Maria::inse(std::string table, std::map<std::string, std::string> data) {
    try {
        std::string columns;
        std::string placeholders;
        std::vector<std::string> values;

        for (const auto& pair : data) {
            if (!columns.empty()) {
                columns += ", ";
                placeholders += ", ";
            }
            columns += pair.first;
            placeholders += "?";
            values.push_back(pair.second);
        }

        std::string query = "INSERT INTO " + table + " (" + columns + ") VALUES (" + placeholders + ")";
        std::shared_ptr<sql::PreparedStatement> pstmt(conn_->prepareStatement(query));
        int index = 1;
        for (const auto& value : values) {
            pstmt->setString(index++, value);
        }
        pstmt->execute();
        return true;
    } catch (sql::SQLException &e) {
        std::cerr << "Insert failed: " << e.what() << std::endl;
        return false;
    }
}