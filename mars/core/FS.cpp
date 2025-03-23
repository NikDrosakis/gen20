#include "FS.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <sys/inotify.h>
#include <unistd.h>
#include <cstring>
#include <thread>

namespace mars {
    FS::FS() {}
    FS::~FS() {}

    bool FS::readFile(const std::string& filePath, std::string& content) {
        std::ifstream file(filePath);
        if (!file.is_open()) {
            std::cerr << "Error opening file: " << filePath << std::endl;
            return false;
        }
        std::stringstream buffer;
        buffer << file.rdbuf();
        content = buffer.str();
        file.close();
        if (content.empty()) {
            std::cerr << "File is empty: " << filePath << std::endl;
            return false;
        }
        return true;
    }

    bool FS::writeFile(const std::string& filePath, const std::string& content) {
        std::ofstream file(filePath);
        if (!file.is_open()) {
            std::cerr << "Error opening file for writing: " << filePath << std::endl;
            return false;
        }
        file << content;
        file.close();
        return true;
    }

    bool FS::monitorChanges(const std::string& directory, std::function<void(const std::string& event)> callback) {
        int fd = inotify_init();
        if (fd < 0) {
            std::cerr << "Error initializing inotify" << std::endl;
            return false;
        }

        int wd = inotify_add_watch(fd, directory.c_str(), IN_CREATE | IN_MODIFY | IN_DELETE);
        if (wd < 0) {
            std::cerr << "Error adding watch to directory: " << directory << std::endl;
            close(fd);
            return false;
        }

        std::thread([fd, wd, directory, callback]() {
            char buffer[4096];
            while (true) {
                int length = read(fd, buffer, sizeof(buffer));
                if (length < 0) {
                    std::cerr << "Error reading inotify events" << std::endl;
                    break;
                }

                int i = 0;
                while (i < length) {
                    struct inotify_event *event = (struct inotify_event *) &buffer[i];
                    if (event->len) {
                        std::string eventName;
                        if (event->mask & IN_CREATE) {
                            eventName = "File created: " + std::string(event->name);
                        } else if (event->mask & IN_MODIFY) {
                            eventName = "File modified: " + std::string(event->name);
                        } else if (event->mask & IN_DELETE) {
                            eventName = "File deleted: " + std::string(event->name);
                        }
                        callback(eventName);
                    }
                    i += sizeof(struct inotify_event) + event->len;
                }
            }
            inotify_rm_watch(fd, wd);
            close(fd);
        }).detach();
        return true;
    }
}