# /var/www/gs/mars/CMakeLists.txt
cmake_minimum_required(VERSION 3.15)
project(mars CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ============================================================
# Sources
# ============================================================
set(SOURCES
    main.cpp
    core/Maria.cpp
    core/Yaml.cpp
    core/FS.cpp
    core/Ws.cpp
    # === CUBOS:START ===
    cubos/aggregator.cpp
    ##cubos/hello/hello.cpp
    # === CUBOS:END ===
)

# ============================================================
# Target
# ============================================================
add_executable(mars ${SOURCES})

# ============================================================
# Include dirs
# ============================================================
target_include_directories(mars PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/core
    ${CMAKE_CURRENT_SOURCE_DIR}/cubos
)

# ============================================================
# Libraries
# ============================================================
find_package(PkgConfig REQUIRED)

find_package(Boost REQUIRED COMPONENTS system thread)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

# yaml-cpp
find_package(yaml-cpp REQUIRED)

target_link_libraries(mars PRIVATE
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
    yaml-cpp
    mariadb
    mariadbcpp
)