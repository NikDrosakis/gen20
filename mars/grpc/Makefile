GRPC_FILES = grpc/service.grpc.pb.cc grpc/service.pb.cc
CORE_FILES = core/Cubo.cpp core/Maria.cpp core/Ws.cpp

all: $(GRPC_FILES) $(CORE_FILES)
    g++ -std=c++17 -o mars_grpc_server $(GRPC_FILES) $(CORE_FILES) -lgrpc++ -lprotobuf