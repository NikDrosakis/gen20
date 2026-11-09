// /var/www/gs/mars/cubos/hello/hello.cpp
#include "hello.h"
#include <iostream>

namespace cubo_hello {

void register_routes() {
    std::cout << "  [hello] registering route GET /god/v1/hello" << std::endl;
    // Εδώ θα γίνει register στο router του mars
    // (π.χ. router.add_route("GET", "/god/v1/hello", hello_handler))
}

void hello_handler() {
    std::cout << "Hello from cubo!" << std::endl;
}

} // namespace cubo_hello