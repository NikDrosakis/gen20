#ifndef RETHINK_H
#define RETHINK_H

#include <string>
#include <nlohmann/json.hpp>
#include <rethinkdb.h> // Include rethinkdb.h here

using json = nlohmann::json;

class MyRethinkDB {
public:
    MyRethinkDB(const std::string& host, int port, const std::string& dbName, const std::string& tableName)
        : host_(host), port_(port), dbName_(dbName), tableName_(tableName), conn_(nullptr) {} // Initialize conn_

    bool connect();
    bool upsertMessage(const std::string& id, const std::string& jsonString);
    bool deleteMessage(const std::string& id);
    std::string getMessage(const std::string& id);
    rdb_cursor_t* startChangefeed();

private:
    std::string host_;
    int port_;
    std::string dbName_;
    std::string tableName_;
    rdb_connection_t* conn_;
};

#endif // RETHINK_H