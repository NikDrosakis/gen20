#ifndef GREDIS_H
#define GREDIS_H

#include <hiredis/hiredis.h>
#include <string>
#include <vector>

class Gredis {
private:
    redisContext *context;

public:
    Gredis(std::string host = "127.0.0.1", int port = 6379);
    ~Gredis();

    bool set(std::string key, std::string value);
    std::string get(std::string key);
    bool append(std::string key, std::string value);
    void close();

    std::vector<std::string> keys();  // Declaration of the keys() function
};

#endif // GREDIS_H
