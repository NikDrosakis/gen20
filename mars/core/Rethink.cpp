#include "Rethink.h"
#include <iostream>
#include <sstream>
#include <nlohmann/json.hpp>
#include <rethinkdb.h>

using json = nlohmann::json;

RethinkDB::RethinkDB(const std::string& host, int port, const std::string& dbName, const std::string& tableName)
    : host_(host), port_(port), dbName_(dbName), tableName_(tableName) {
    conn_ = nullptr;
}

RethinkDB::~RethinkDB() {
    if (conn_) {
        rdb_close(conn_);
    }
}

bool RethinkDB::connect() {
    conn_ = rdb_connect(host_.c_str(), port_);
    if (!conn_) {
        std::cerr << "Error connecting to RethinkDB: " << rdb_last_error() << std::endl;
        return false;
    }
    return true;
}

bool RethinkDB::createDatabaseAndTable() {
    // Check if the database exists
    rdb_cursor_t* cursor = rdb_run(conn_, rdb_db_list());
    if (!cursor) {
        std::cerr << "Error listing databases: " << rdb_last_error() << std::endl;
        return false;
    }

    bool dbExists = false;
    rdb_datum_t* datum;
    while ((datum = rdb_cursor_next(cursor))) {
        if (strcmp(rdb_string(datum), dbName_.c_str()) == 0) {
            dbExists = true;
            rdb_datum_free(datum);
            break;
        }
        rdb_datum_free(datum);
    }
    rdb_cursor_close(cursor);

    if (!dbExists) {
        // Create the database
        rdb_cursor_t* createDbCursor = rdb_run(conn_, rdb_db_create(dbName_.c_str()));
        if (!createDbCursor) {
            std::cerr << "Error creating database: " << rdb_last_error() << std::endl;
            return false;
        }
        rdb_cursor_close(createDbCursor);
        std::cout << "Database '" << dbName_ << "' created." << std::endl;
    }

    // Check if the table exists
    rdb_cursor_t* tableCursor = rdb_run(conn_, rdb_db(dbName_.c_str())->table_list());
    if (!tableCursor) {
        std::cerr << "Error listing tables: " << rdb_last_error() << std::endl;
        return false;
    }

    bool tableExists = false;
    while ((datum = rdb_cursor_next(tableCursor))) {
        if (strcmp(rdb_string(datum), tableName_.c_str()) == 0) {
            tableExists = true;
            rdb_datum_free(datum);
            break;
        }
        rdb_datum_free(datum);
    }
    rdb_cursor_close(tableCursor);

    if (!tableExists) {
        // Create the table
        rdb_cursor_t* createTableCursor = rdb_run(conn_, rdb_db(dbName_.c_str())->table_create(tableName_.c_str()));
        if (!createTableCursor) {
            std::cerr << "Error creating table: " << rdb_last_error() << std::endl;
            return false;
        }
        rdb_cursor_close(createTableCursor);
        std::cout << "Table '" << tableName_ << "' created." << std::endl;
    }

    return true;
}


bool RethinkDB::insertMessage(const std::string& jsonString) {
    if (!conn_) {
        std::cerr << "Not connected to RethinkDB." << std::endl;
        return false;
    }
    // Parse the JSON string
    json chatData = json::parse(jsonString);

    // Insert data into the table
    rdb_query_t* query = rdb_db(dbName_.c_str())->table(tableName_.c_str())->insert(rdb_json(jsonString.c_str()));
    rdb_cursor_t* cursor = rdb_run(conn_, query);
    if (!cursor) {
        std::cerr << "Error inserting message: " << rdb_last_error() << std::endl;
        return false;
    }

    rdb_cursor_close(cursor);
    rdb_query_free(query);
    return true;
}

rdb_cursor_t* RethinkDB::startChangefeed() {
    if (!conn_) {
        std::cerr << "Not connected to RethinkDB." << std::endl;
        return nullptr;
    }
    rdb_query_t* query = rdb_db(dbName_.c_str())->table(tableName_.c_str())->changes();
    rdb_cursor_t* cursor = rdb_run(conn_, query);
    if (!cursor) {
        std::cerr << "Error starting changefeed: " << rdb_last_error() << std::endl;
        return nullptr;
    }
    rdb_query_free(query);
    return cursor;
}