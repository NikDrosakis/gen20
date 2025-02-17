#include "server.h"
#include <iostream>
#include <memory>
#include <string>
#include <grpcpp/grpcpp.h>
#include "service.grpc.pb.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::Status;
using mars::MarsService;
using mars::StatusRequest;
using mars::StatusResponse;

class MarsServiceImpl final : public MarsService::Service {
    Status GetStatus(ServerContext* context, const StatusRequest* request, StatusResponse* reply) override {
        reply->set_status("Mars Service is Running");
        return Status::OK;
    }
};

void RunServer() {
    std::string server_address("0.0.0.0:3004");
    MarsServiceImpl service;

    ServerBuilder builder;
    builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
    builder.RegisterService(&service);

    std::unique_ptr<Server> server(builder.BuildAndStart());
    std::cout << "Mars gRPC Server Listening on " << server_address << std::endl;
    server->Wait();
}


