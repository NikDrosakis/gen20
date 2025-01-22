#ifndef MARS_FS_H
#define MARS_FS_H

#include <string>
#include <functional>


namespace mars {
    class FS {
    public:
        FS();
        ~FS();

        bool readFile(const std::string& filePath, std::string& content);
        bool writeFile(const std::string& filePath, const std::string& content);
        bool monitorChanges(const std::string& directory, std::function<void(const std::string& event)> callback);
    };
}

#endif