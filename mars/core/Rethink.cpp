#include "Rethink.h"
#include <nlohmann/json.hpp>
#include <iostream>
#include <rethinkdb.h> // Include rethinkdb.h here

using json = nlohmann::json;

MyRethinkDB::MyRethinkDB(const std::string& host, int port, const std::string& dbName, const std::string& tableName)
    : host_(host), port_(port), dbName_(dbName), tableName_(tableName) {
    conn_ = nullptr;
}

bool MyRethinkDB::connect() {
    conn_ = rdb_connect(host_.c_str(), port_);
    return conn_ != nullptr;
}

bool MyRethinkDB::upsertMessage(const std::string& id, const std::string& jsonString) {
    if (!conn_) return false;

    // Perform upsert (insert or update)
    rdb_query_t* query = rdb_db(dbName_.c_str())->table(tableName_.c_str())
                         ->get(id)
                         ->insert(rdb_json(jsonString.c_str()), RETHINKDB_INSERT_OPT_CONFILCT("replace"));
    rdb_cursor_t* cursor = rdb_run(conn_, query);
    if (!cursor) return false;
    rdb_cursor_close(cursor);
    rdb_query_free(query);
    return true;
}

bool MyRethinkDB::deleteMessage(const std::string& id) {
    if (!conn_) return false;
    rdb_query_t* query = rdb_db(dbName_.c_str())->table(tableName_.c_str())->get(id)->delete_();
    rdb_cursor_t* cursor = rdb_run(conn_, query);
    if (!cursor) return false;
    rdb_cursor_close(cursor);
    rdb_query_free(query);
    return true;
}

std::string MyRethinkDB::getMessage(const std::string& id) {
    if (!conn_) return "";
    rdb_query_t* query = rdb_db(dbName_.c_str())->table(tableName_.c_str())->get(id);
    rdb_cursor_t* cursor = rdb_run(conn_, query);
    if (!cursor) return "";
    rdb_datum_t* datum = rdb_cursor_next(cursor);
    if (!datum) return "";
    std::string result = rdb_string(datum);
    rdb_cursor_close(cursor);
    rdb_query_free(query);
    return result;
}

rdb_cursor_t* MyRethinkDB::startChangefeed() {
    if (!conn_) return nullptr;
    rdb_query_t* query = rdb_db(dbName_.c_str())->table(tableName_.c_str())->changes();
    rdb_cursor_t* cursor = rdb_run(conn_, query);
    rdb_query_free(query);
    return cursor;
}