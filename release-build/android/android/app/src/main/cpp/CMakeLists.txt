cmake_minimum_required(VERSION 3.22.1)
project(shikshaai_granite LANGUAGES C CXX)

include(FetchContent)
FetchContent_Declare(
    llama_cpp
    URL https://github.com/ggml-org/llama.cpp/archive/b29c606e28a01b1bc8c1351026a0fa6e616bf6c4.tar.gz
    URL_HASH SHA256=03fb04316eb32a7b7347004a79a8dd60531c02f5a064d853fed3b53828951723
)
FetchContent_MakeAvailable(llama_cpp)

add_library(shikshaai_granite SHARED granite_jni.cpp)
target_compile_features(shikshaai_granite PRIVATE cxx_std_17)
target_link_libraries(shikshaai_granite PRIVATE llama android log)
