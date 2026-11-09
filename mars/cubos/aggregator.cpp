// /var/www/gs/mars/cubos/aggregator.cpp
#include "aggregator.h"
#include <vector>
#include <string>
#include <functional>
#include <iostream>

// === CUBOS:START === (auto-generated)
// Forward declarations για κάθε cubo
// (θα μπουν από το sun/com/cubo)
// === CUBOS:END ===

namespace cubos {

struct CuboEntry {
    std::string name;
    std::function<void()> register_fn;
};

std::vector<CuboEntry>& registry() {
    static std::vector<CuboEntry> entries;
    return entries;
}

void register_all() {
    std::cout << "[cubos] registering..." << std::endl;

    // === CUBOS:START === (auto-generated)
    // registry().push_back({"hello", cubo_hello::register_routes});
    // === CUBOS:END ===

    for (auto& e : registry()) {
        std::cout << "[cubos]   ✓ " << e.name << std::endl;
        e.register_fn();
    }
    std::cout << "[cubos] all registered" << std::endl;
}

} // namespace cubos