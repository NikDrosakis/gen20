#include <mariadb/conncpp.hpp>
#include <iostream>
#include <map>
#include <string>

class Maria {
private:
    std::string _dbHost;
    std::string _dbUser;
    std::string _dbPass;
    std::string _database;
    sql::Driver *driver;
    std::shared_ptr<sql::Connection> conn;

public:
    Maria(std::string dbname = "")
        : _dbHost("localhost"), _dbUser("root"), _dbPass("n130177!"), _database(dbname) {
        driver = sql::mariadb::get_driver_instance();
    }

    bool connect() {
        try {
            sql::SQLString url(_dbHost);
            sql::Properties properties({
                {"user", _dbUser},
                {"password", _dbPass}
            });
            conn = std::shared_ptr<sql::Connection>(driver->connect(url, properties));
            conn->setSchema(_database);
            return true;
        } catch (sql::SQLException &e) {
            std::cerr << "Connection failed: " << e.what() << std::endl;
            return false;
        }
    }

    std::vector<std::map<std::string, std::string>> fa(const std::string& query, const std::map<int, std::string>& params) {
        std::vector<std::map<std::string, std::string>> result;
        try {
            std::string queryType = query.substr(0, query.find(' '));
            if (queryType != "SELECT" && queryType != "DESCRIBE") {
                return {};
            }

            std::shared_ptr<sql::PreparedStatement> pstmt(conn->prepareStatement(query));
         //   int index = 1;
            for (const auto &param : params) {
                 (void)param;
            }

            std::shared_ptr<sql::ResultSet> res(pstmt->executeQuery());
            sql::ResultSetMetaData* meta = res->getMetaData();
            int colCount = meta->getColumnCount();

            while (res->next()) {
                std::map<std::string, std::string> row;
                for (int col = 1; col <= colCount; ++col) {
                   row[std::string(meta->getColumnName(col))] = res->getString(col);
                }
                result.push_back(row);
            }
        } catch (sql::SQLException &e) {
            std::cerr << "Fetch failed: " << e.what() << std::endl;
        }
        return result;
    }

    std::map<std::string, std::string> f(const std::string& query, const std::map<int, std::string>& params) {
        std::map<std::string, std::string> result;
        try {
            std::string queryType = query.substr(0, query.find(' '));
            if (queryType != "SELECT") {
                return {};
            }

            std::shared_ptr<sql::PreparedStatement> pstmt(conn->prepareStatement(query));
      //      int index = 1;
            for (const auto &param : params) {
                 (void)param;
            }

            std::shared_ptr<sql::ResultSet> res(pstmt->executeQuery());
            sql::ResultSetMetaData* meta = res->getMetaData();
            int colCount = meta->getColumnCount();

            if (res->next()) {
                for (int col = 1; col <= colCount; ++col) {
                    result[std::string(meta->getColumnName(col))] = res->getString(col);
                }
            }
        } catch (sql::SQLException &e) {
            std::cerr << "Fetch failed: " << e.what() << std::endl;
        }
        return result;
    }

    bool q(const std::string& query, const std::map<std::string, std::string>& params) {
        try {
            std::shared_ptr<sql::PreparedStatement> pstmt(conn->prepareStatement(query));
            int index = 1;
            for (const auto &param : params) {
                pstmt->setString(index++, param.second);
            }

            pstmt->execute();
            return true;
        } catch (sql::SQLException &e) {
            std::cerr << "Query execution failed: " << e.what() << std::endl;
            return false;
        }
    }

    bool inse(std::string table, std::map<std::string, std::string> params) {
        try {
            std::string query = "INSERT INTO " + table + " (";
            for (const auto &param : params) {
                query += param.first + ",";
            }
            query.pop_back(); // Remove trailing comma
            query += ") VALUES (";
for (const auto& elem : params) { 
                query += "?,";  // Placeholder for values
            }
            query.pop_back(); // Remove trailing comma
            query += ")";

            std::shared_ptr<sql::PreparedStatement> pstmt(conn->prepareStatement(query));
            int index = 1;
            for (const auto &param : params) {
                pstmt->setString(index++, param.second);
            }

            pstmt->execute();
            return true;
        } catch (sql::SQLException &e) {
            std::cerr << "Insert failed: " << e.what() << std::endl;
            return false;
        }
    }
};
