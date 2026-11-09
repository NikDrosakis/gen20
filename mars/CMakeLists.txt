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
    Cubo.cpp
    FS.cpp
    Maria.cpp
    Ws.cpp
    Yaml.cpp
    wss_client.cpp
    # === CUBOS:START ===
    cubos/aggregator.cpp
    cubos/hello/hello.cpp
    # === CUBOS:END ===
)

# ============================================================
# Target
# ============================================================
add_executable(mars ${SOURCES})

# Libraries (προσάρμοσε)
find_package(PkgConfig REQUIRED)
# pkg_check_modules(...)

target_include_directories(mars PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/cubos
)