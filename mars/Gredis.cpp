#include <iostream>
#include <hiredis/hiredis.h>
#include <string>
#include <cstring>
class Gredis {
private:
    redisContext *context;

public:
    Gredis(std::string host = "127.0.0.1", int port = 6379) {
        context = redisConnect(host.c_str(), port);
        if (context == NULL || context->err) {
            if (context) {
                std::cerr << "Error: " << context->errstr << std::endl;
            } else {
                std::cerr << "Can't allocate redis context" << std::endl;
            }
            exit(1);
        }
    }

    // Set cache
    bool set(std::string key, std::string value) {
        redisReply *reply = (redisReply *)redisCommand(context, "SET %s %s", key.c_str(), value.c_str());
        bool success = (reply->type == REDIS_REPLY_STATUS && strcasecmp(reply->str, "OK") == 0);
        freeReplyObject(reply);
        return success;
    }

    // Get cache
    std::string get(std::string key) {
        redisReply *reply = (redisReply *)redisCommand(context, "GET %s", key.c_str());
        std::string result = reply->str ? reply->str : "";
        freeReplyObject(reply);
        return result;
    }

    // Append to cache
    bool append(std::string key, std::string value) {
        redisReply *reply = (redisReply *)redisCommand(context, "APPEND %s %s", key.c_str(), value.c_str());
        bool success = (reply->integer > 0);
        freeReplyObject(reply);
        return success;
    }

    // Close connection
    void close() {
        redisFree(context);
    }
};
